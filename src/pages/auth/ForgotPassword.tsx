import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail } from 'lucide-react'
import { validateEmail } from '../../validation/validators'
import Input from '../../components/common/Input'
import FormField from '../../components/common/FormField'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

// Placeholder screen linked from the Login page's "Forgot password?" action.
// No backend reset-password endpoint was provided in the inferred contract,
// so this only shows a confirmation state.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sent, setSent] = useState(false)

  const error = submitted ? validateEmail(email) : ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (validateEmail(email) !== '') return
    // MOCK: no password-reset endpoint exists in the inferred backend
    // contract yet; this simulates a successful request being sent.
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-8 shadow-card">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <GraduationCap size={26} className="text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Reset your password</h1>
          <p className="text-center text-sm text-muted">
            Enter your account email and we will send you reset instructions.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Mail size={32} className="text-success" />
            <p className="text-sm text-gray-700">
              If an account exists for <span className="font-medium">{email}</span>, reset instructions have been sent.
            </p>
            <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
              Back to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="forgot-email" error={error} required>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </FormField>

            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
