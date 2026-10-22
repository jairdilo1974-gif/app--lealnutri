import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, User, neonAuth } from '@/services/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (nome: string, email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => AuthService.getCurrentUser())
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const active = AuthService.getCurrentUser()
    if (active) {
      setUser(active)
    }

    if (neonAuth) {
      neonAuth
        .getSession()
        .then((res: any) => {
          if (res?.data?.user) {
            const authUser = res.data.user
            const syncedUser: User = {
              id: authUser.id,
              nome: authUser.name || authUser.email.split('@')[0],
              email: authUser.email,
              createdAt: authUser.createdAt ? String(authUser.createdAt) : undefined,
            }
            setUser(syncedUser)
            AuthService.setSession(syncedUser)
          }
        })
        .catch((err) => {
          console.debug('Verificação de sessão em segundo plano:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const loggedUser = await AuthService.signIn(email, pass)
    setUser(loggedUser)
  }

  const register = async (nome: string, email: string, pass: string) => {
    const newUser = await AuthService.signUp(nome, email, pass)
    setUser(newUser)
  }

  const logout = async () => {
    await AuthService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
