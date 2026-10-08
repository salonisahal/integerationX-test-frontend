import apiClient from './client'
import type { AuthTokens, User } from '../types'

// Inferred from backend contract: POST /api/v1/auth/login -> AuthTokensResponse.
// Verify the exact response envelope (wrapped vs flat) against the real backend.
export async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await apiClient.post('/api/v1/auth/login', { email, password })
  return response.data?.data ?? response.data
}

// Inferred: POST /api/v1/auth/register -> UserResponse.
export async function register(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}): Promise<User> {
  const response = await apiClient.post('/api/v1/auth/register', input)
  return response.data?.data ?? response.data
}

// Inferred: POST /api/v1/auth/refresh (body: RefreshRequest) -> AuthTokensResponse.
export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken })
  return response.data?.data ?? response.data
}

// Inferred: POST /api/v1/auth/logout (body: LogoutRequest) -> Void.
export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post('/api/v1/auth/logout', { refreshToken })
}

// Inferred: GET /api/v1/auth/me -> UserResponse.
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/api/v1/auth/me')
  return response.data?.data ?? response.data
}
