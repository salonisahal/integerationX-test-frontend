import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/authApi'
import type { Role, User } from '../types'
import { ACCESS_TOKEN_KEY, AUTH_USER_KEY, REFRESH_TOKEN_KEY } from '../constants/storageKeys'

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  role: Role | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): User | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const tokens = await authApi.login(email, password)
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokens.user))
      setAccessToken(tokens.accessToken)
      setRefreshTokenValue(tokens.refreshToken)
      setUser(tokens.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    try {
      if (storedRefreshToken) {
        await authApi.logoutRequest(storedRefreshToken)
      }
    } catch {
      // Ignore logout API failures — session is cleared locally regardless
      // so the user is never stuck unable to sign out.
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      setAccessToken(null)
      setRefreshTokenValue(null)
      setUser(null)
    }
  }, [])

  const getCurrentUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser()
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser))
    setUser(currentUser)
  }, [])

  useEffect(() => {
    if (accessToken && !user) {
      getCurrentUser().catch(() => {
        // Access token is stale/invalid; the API client's interceptor will
        // already have redirected to /login on a 401 if applicable.
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken && user),
      user,
      role: user?.role ?? null,
      accessToken,
      refreshToken: refreshTokenValue,
      loading,
      login,
      logout,
      getCurrentUser,
    }),
    [accessToken, user, refreshTokenValue, loading, login, logout, getCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
