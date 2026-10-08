import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import type { ApiErrorShape } from '../types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/storageKeys'

// Centralized axios instance. Every API module in src/api must import this
// instance rather than instantiating axios/fetch directly, per project rules.
// Base URL is read from VITE_API_BASE_URL (see .env.example) and defaults to
// a relative '' so requests stay relative until a real backend URL is set.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<() => void> = []

function resolveQueue() {
  pendingQueue.forEach((callback) => callback())
  pendingQueue = []
}

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

function extractMessage(error: AxiosError<ApiErrorShape>): string {
  const status = error.response?.status
  const serverMessage = error.response?.data?.message

  if (!error.response) {
    return 'Network error. Please check your connection and try again.'
  }

  switch (status) {
    case 400:
      return serverMessage || 'Bad request. Please check your input.'
    case 401:
      return serverMessage || 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return serverMessage || 'The requested resource could not be found.'
    case 409:
      return serverMessage || 'This record already exists.'
    case 422:
      return serverMessage || 'Validation failed. Please check the form.'
    case 500:
      return 'Something went wrong. Please try again later.'
    default:
      return serverMessage || 'Something went wrong. Please try again later.'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorShape>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status

    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        clearSession()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        if (!isRefreshing) {
          isRefreshing = true
          const response = await axios.post(`${apiClient.defaults.baseURL}/api/v1/auth/refresh`, {
            refreshToken,
          })
          const tokens = response.data?.data ?? response.data
          localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
          isRefreshing = false
          resolveQueue()
        }

        return new Promise((resolve) => {
          pendingQueue.push(() => {
            resolve(apiClient(originalRequest))
          })
        })
      } catch (refreshError) {
        isRefreshing = false
        clearSession()
        toast.error('Your session has expired. Please log in again.')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    const message = extractMessage(error)

    // Surface exactly one toast per failed request here (never duplicated in
    // a component's own catch block) so API failures are always visible,
    // per the "No Fake Integration" requirement.
    if (status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
