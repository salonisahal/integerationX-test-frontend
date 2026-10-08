import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUser, getUser, updateUser } from '../../api/userApi'
import { validateEmail, validatePassword, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'
import type { Role } from '../../types'

interface FormState {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'STUDENT',
  status: 'ACTIVE',
}

export default function UserForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUser(id)
      .then((user) => {
        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: '',
          role: user.role,
          status: user.status,
        })
      })
      .catch(() => toast.error('Unable to load user record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      firstName: validateRequired(form.firstName, 'First name'),
      lastName: validateRequired(form.lastName, 'Last name'),
      email: validateEmail(form.email),
      password: isEditMode && !form.password ? '' : validatePassword(form.password),
    }
  }

  const errors = runValidation()
  const isValid = Object.values(errors).every((message) => message === '')
  const errorsToShow = submitted ? errors : {}

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    setSubmitting(true)
    try {
      if (isEditMode && id) {
        await updateUser(id, form)
        toast.success('User updated successfully.')
      } else {
        await createUser(form)
        toast.success('User created successfully.')
      }
      navigate(ROUTES.USERS)
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading user record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit User' : 'Add User'} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First Name" htmlFor="firstName" required error={errorsToShow.firstName}>
            <Input id="firstName" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </FormField>

          <FormField label="Last Name" htmlFor="lastName" required error={errorsToShow.lastName}>
            <Input id="lastName" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </FormField>

          <FormField label="Email" htmlFor="email" required error={errorsToShow.email}>
            <Input id="email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </FormField>

          <FormField
            label={isEditMode ? 'New Password' : 'Password'}
            htmlFor="password"
            required={!isEditMode}
            error={errorsToShow.password}
            helperText="At least 6 characters. Leave blank to keep the current password."
          >
            <Input id="password" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
          </FormField>

          <FormField label="Role" htmlFor="role" required>
            <Select id="role" value={form.role} onChange={(event) => updateField('role', event.target.value as Role)}>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </Select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(event) => updateField('status', event.target.value as 'ACTIVE' | 'INACTIVE')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  )
}
