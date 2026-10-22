import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight, ShieldCheck, Check } from 'lucide-react'

interface RegisterCardProps {
  onNavigateToLogin: () => void
}

export const RegisterCard: React.FC<RegisterCardProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isPasswordValid = password.length >= 9
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nome.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, forneça um endereço de e-mail válido.')
      return
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres para garantir a segurança da conta.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha informada.')
      return
    }

    try {
      setIsLoading(true)
      await register(nome, email, password)
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Falha ao realizar cadastro. Por favor, tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-slate-100/80 shadow-2xl shadow-blue-950/5">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="flex justify-center pb-2">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Crie sua conta profissional
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Cadastre-se na plataforma LEAL NUTRI para iniciar seus atendimentos e prescrições.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-5">
              <Alert variant="destructive">
                <span className="font-medium text-red-800 leading-relaxed block">
                  {errorMessage}
                </span>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="register-nome">Nome completo</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <Input
                  id="register-nome"
                  type="text"
                  placeholder="Dra. Mariana Silva"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email">E-mail profissional</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="mariana@nutricao.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="register-password">Senha</Label>
                <span className={`text-[11px] font-medium flex items-center gap-1 ${isPasswordValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isPasswordValid && <Check className="w-3 h-3" />}
                  Mínimo 9 caracteres
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Mínimo 9 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="register-confirm">Confirmar senha</Label>
                {confirmPassword && (
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {passwordsMatch ? 'Senhas conferem' : 'Senhas divergentes'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-3 font-semibold text-base transition-all group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando sua conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-100 bg-slate-50/60 p-5 rounded-b-2xl">
          <p className="text-center text-sm text-slate-600">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline transition-colors"
            >
              Faça login
            </button>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Dados protegidos na tabela nutricionistas do Neon DB</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
