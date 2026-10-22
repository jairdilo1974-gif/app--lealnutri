import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LoginCard } from '@/components/LoginCard'
import { RegisterCard } from '@/components/RegisterCard'
import { Dashboard } from '@/components/Dashboard'
import { Loader2 } from 'lucide-react'

export function App() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Estado de carregamento da sessão persistida
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Carregando LEAL NUTRI...</p>
      </div>
    )
  }

  // Regra: "Após o login bem sucedido, redirecionar para o dashboard"
  // Regra: "Se já estiver logado e tentar acessar a tela de login, redirecionar direto para o dashboard"
  if (user) {
    return <Dashboard />
  }

  // Telas de autenticação (Login e Cadastro) com design azul e branco
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/60 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {authMode === 'login' ? (
          <LoginCard onNavigateToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterCard onNavigateToLogin={() => setAuthMode('login')} />
        )}
      </div>

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} LEAL NUTRI. Todos os direitos reservados.
      </footer>
    </div>
  )
}

export default App
