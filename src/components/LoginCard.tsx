import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react'

interface LoginCardProps {
  onNavigateToRegister: () => void
}

export const LoginCard: React.FC<LoginCardProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor, insira sua senha.')
      return
    }

    try {
      setIsLoading(true)
      await login(email, password)
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Não foi possível entrar. Verifique seu e-mail e senha e tente novamente.'
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
            Acesse seu consultório
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Entre com suas credenciais de nutricionista para gerenciar seus pacientes e planos.
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
              <Label htmlFor="login-email">E-mail profissional</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="exemplo@nutricionista.com"
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
                <Label htmlFor="login-password">Senha de acesso</Label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="•••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 font-semibold text-base transition-all group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Acessando sistema...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-100 bg-slate-50/60 p-5 rounded-b-2xl">
          <p className="text-center text-sm text-slate-600">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline transition-colors"
            >
              Cadastre-se
            </button>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Ambiente seguro com Neon Auth & Criptografia</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
