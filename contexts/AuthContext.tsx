'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setToken as saveToken, getToken, getUser, clearToken, isAuthenticated as checkAuth } from '@/lib/auth-token'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = getToken()
    const storedUser = getUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }

    setLoading(false)
  }, [])

  // Redirect to login if not authenticated and not on login or setup page
  useEffect(() => {
    if (!loading && !checkAuth() && pathname !== '/login' && pathname !== '/setup') {
      router.push('/login')
    }
  }, [loading, pathname, router])

  const login = async (email: string, password: string) => {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    // Store token (user info is decoded from token)
    saveToken(data.access_token)

    setToken(data.access_token)
    setUser(getUser())

    router.push('/dashboard')
  }

  const logout = () => {
    clearToken()
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
