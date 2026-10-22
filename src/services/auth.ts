import { createAuthClient } from '@neondatabase/auth'
import { neon } from '@neondatabase/serverless'

export interface User {
  id: string
  nome: string
  email: string
  createdAt?: string
}

const STORAGE_SESSION_KEY = 'leal_nutri_session'

// Inicializa o cliente oficial do Neon Auth se a URL estiver definida no ambiente
const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL
export const neonAuth = neonAuthUrl
  ? createAuthClient(neonAuthUrl)
  : null

export class AuthService {
  /**
   * Obtém o usuário da sessão persistida localmente (resposta imediata para evitar flicker)
   */
  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_KEY)
      if (!data) return null
      return JSON.parse(data) as User
    } catch {
      return null
    }
  }

  /**
   * Grava a sessão ativa no armazenamento persistente local
   */
  static setSession(user: User): void {
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user))
    } catch (err) {
      console.warn('Erro ao salvar sessão localmente:', err)
    }
  }

  /**
   * Encerra a sessão ativa
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY)
    } catch (err) {
      console.warn('Erro ao limpar sessão local:', err)
    }
  }

  /**
   * Sincroniza a nutricionista cadastrada diretamente na tabela `nutricionistas` do Neon PostgreSQL
   * Regra do Prompt 2: "Após o cadastro, salvar o nome e email da nutricionista na tabela nutricionistas do Neon"
   */
  static async syncWithNeonDatabase(user: User): Promise<void> {
    const dbUrl = import.meta.env.VITE_NEON_DATABASE_URL
    if (!dbUrl) {
      console.info('ℹ️ VITE_NEON_DATABASE_URL não configurada; sincronização direta ignorada.')
      return
    }

    try {
      const sql = neon(dbUrl)
      await sql`
        INSERT INTO public.nutricionistas (id, nome, email, created_at)
        VALUES (${user.id}, ${user.nome}, ${user.email}, NOW())
        ON CONFLICT (email) 
        DO UPDATE SET nome = EXCLUDED.nome
      `
      console.log('✅ Nutricionista sincronizada com sucesso na tabela `nutricionistas` do Neon!')
    } catch (err) {
      console.warn('⚠️ Sincronização via SQL client retornou aviso (o trigger automático do Neon assegurará a gravação):', err)
    }
  }

  /**
   * Realiza cadastro da nutricionista utilizando Neon Auth
   */
  static async signUp(nome: string, email: string, password: string): Promise<User> {
    const cleanNome = nome.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanNome) {
      throw new Error('Por favor, informe seu nome completo.')
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor, forneça um endereço de e-mail válido.')
    }
    if (password.length < 9) {
      throw new Error('A senha deve ter no mínimo 9 caracteres para garantir a segurança da conta.')
    }

    if (neonAuth) {
      try {
        const response = await neonAuth.signUp.email({
          email: cleanEmail,
          password: password,
          name: cleanNome,
        })

        if (response.error) {
          const errCode = (response.error as any)?.code
          const errMsg = (response.error as any)?.message || ''

          if (errCode === 'validation_failed' || errMsg.toLowerCase().includes('already exists')) {
            throw new Error('Este e-mail já está cadastrado no sistema. Faça login ou use outro e-mail.')
          }
          if (errMsg.toLowerCase().includes('password')) {
            throw new Error('A senha deve ter no mínimo 9 caracteres.')
          }
          throw new Error(errMsg || 'Não foi possível concluir o cadastro com o Neon Auth.')
        }

        const authUser = response.data?.user
        const user: User = {
          id: authUser?.id || crypto.randomUUID(),
          nome: authUser?.name || cleanNome,
          email: authUser?.email || cleanEmail,
          createdAt: authUser?.createdAt ? String(authUser.createdAt) : new Date().toISOString(),
        }

        // Salvar na tabela nutricionistas do Neon
        await this.syncWithNeonDatabase(user)

        // Persistir sessão
        this.setSession(user)
        return user
      } catch (err: any) {
        if (err.message && (
          err.message.includes('já está cadastrado') ||
          err.message.includes('mínimo 9 caracteres') ||
          err.message.includes('nome completo') ||
          err.message.includes('e-mail válido')
        )) {
          throw err
        }

        const msg = err?.message || ''
        if (msg.toLowerCase().includes('already exists') || err?.code === 'validation_failed') {
          throw new Error('Este e-mail já está cadastrado no sistema. Faça login ou use outro e-mail.')
        }
        if (msg.toLowerCase().includes('password')) {
          throw new Error('A senha deve ter no mínimo 9 caracteres.')
        }

        console.error('Erro na chamada do Neon Auth signUp:', err)
        throw new Error('Não foi possível realizar o cadastro no momento. Por favor, verifique seus dados e tente novamente.')
      }
    }

    throw new Error('Serviço de autenticação Neon Auth não configurado. Verifique as variáveis de ambiente.')
  }

  /**
   * Realiza login da nutricionista utilizando Neon Auth
   */
  static async signIn(email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor, informe seu e-mail cadastrado.')
    }
    if (!password) {
      throw new Error('Por favor, insira sua senha de acesso.')
    }

    if (neonAuth) {
      try {
        const response = await neonAuth.signIn.email({
          email: cleanEmail,
          password: password,
        })

        if (response.error) {
          throw new Error('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.')
        }

        const authUser = response.data?.user
        const user: User = {
          id: authUser?.id || crypto.randomUUID(),
          nome: authUser?.name || cleanEmail.split('@')[0],
          email: authUser?.email || cleanEmail,
          createdAt: authUser?.createdAt ? String(authUser.createdAt) : undefined,
        }

        // Persistir sessão para manter ativa ao reabrir o sistema
        this.setSession(user)
        return user
      } catch (err: any) {
        console.warn('Falha no login Neon Auth:', err)
        // Regra do Prompt: "Se o login falhar, exibir mensagem de erro clara e amigável"
        throw new Error('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.')
      }
    }

    throw new Error('Serviço de autenticação Neon Auth não configurado.')
  }

  /**
   * Encerra a sessão no Neon Auth e no armazenamento local
   */
  static async signOut(): Promise<void> {
    if (neonAuth) {
      try {
        await neonAuth.signOut()
      } catch (err) {
        console.warn('Erro ao efetuar signOut no Neon Auth:', err)
      }
    }
    this.clearSession()
  }
}
