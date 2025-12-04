"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import jwtDecode from 'jwt-decode'
import { useRouter, usePathname } from 'next/navigation'
import api from '../lib/api'

const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('taskflow_token') : null
    if (storedToken) {
      setToken(storedToken)
      try {
        const decoded = jwtDecode(storedToken)
        setUser({ id: decoded.sub })
      } catch {
        window.localStorage.removeItem('taskflow_token')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch (error) {
        console.error('Failed to load profile', error)
      }
    }
    fetchProfile()
  }, [token])

  useEffect(() => {
    if (!loading && !token && pathname?.startsWith('/dashboard')) {
      router.replace('/login')
    }
  }, [loading, token, pathname, router])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    window.localStorage.setItem('taskflow_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    window.localStorage.setItem('taskflow_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    window.localStorage.removeItem('taskflow_token')
    setToken(null)
    setUser(null)
    router.replace('/login')
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token),
      loading
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
