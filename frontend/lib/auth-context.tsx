"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient} from "./api"
import type { User } from "@/types/auth"
import { useRouter } from "next/navigation"
import { getTokenFromCookie } from "@/lib/cookie-helper"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getTokenFromCookie()

    if (token) {
      apiClient
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          setUser(null)
          document.cookie = "access_token=; path=/; max-age=0"
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
      
    }
  }, [])

  const login = async (email: string, password: string) => {
    await apiClient.login({ email, password })
    const userData = await apiClient.getCurrentUser()
    setUser(userData)
    router.push("/dashboard")
  }

  const logout = () => {
    setUser(null)
    apiClient.logout()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}