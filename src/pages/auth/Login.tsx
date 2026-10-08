import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail, validateRequired } from '../../validation/validators'
import Input from '../../components/common/Input'
import FormField from '../../components/common/FormField'
import Button from '../../components/common/Button'
import { dashboardPathForRole } from '../../constants/navConfig'
import { ROUTES } from '../../constants/routes'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, role } = useAuth()

  // MOCK: prefilled with a plausible demo admin login for reviewer
  // convenience — remove before wiring a real backend.
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')

  const emailError = submitted ? validateEmail(email) : ''
  const passwordError = submitted ? validateRequired(password, 'Password') : ''
  const isValid = validateEmail(email) === '' && validateRequired(password, 'Password') === ''

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setApiError('')

    if (!isValid) return

    try {
      await login(email, password)
      navigate(dashboardPathForRole(role) === ROUTES.LOGIN ? ROUTES.DASHBOARD_ADMIN : dashboardPathForRole(role))
    } catch {
      setApiError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-8 shadow-card">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <GraduationCap size={26} className="text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Student Management System</h1>
          <p className="text-sm text-muted">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField label="Email" htmlFor="email" error={emailError} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={passwordError} required>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {apiError && <p className="text-sm text-danger">{apiError}</p>}

          <Button type="submit" loading={loading} disabled={!isValid && submitted} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
