import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { updateUser } from '../../api/userApi'
import { validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { initialsFromName, formatFullName } from '../../utils/formatters'

export default function ProfilePage() {
  const { user, getCurrentUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const firstNameError = submitted ? validateRequired(firstName, 'First name') : ''
  const lastNameError = submitted ? validateRequired(lastName, 'Last name') : ''
  const isValid = validateRequired(firstName, 'First name') === '' && validateRequired(lastName, 'Last name') === ''

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid || !user) return

    setSaving(true)
    try {
      // Inferred: profile self-service reuses PUT /api/v1/users/{id} since
      // no dedicated "update my profile" endpoint was listed in the
      // contract. Verify against the real backend — email and role are
      // intentionally left out of this payload as fields the UI does not
      // let this screen edit.
      await updateUser(user.id, {
        firstName,
        lastName,
        phone,
        email: user.email,
        role: user.role,
        status: user.status,
      })
      await getCurrentUser()
      toast.success('Profile updated successfully.')
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return <p className="text-sm text-muted">Loading profile...</p>
  }

  return (
    <div>
      <PageHeader title="Profile" description="View and update your account information." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary">
            {initialsFromName(formatFullName(user.firstName, user.lastName))}
          </div>
          <p className="text-base font-semibold text-gray-900">{formatFullName(user.firstName, user.lastName)}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary">{user.role}</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border bg-card p-6 shadow-card lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="profile-firstName" required error={firstNameError}>
              <Input id="profile-firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </FormField>

            <FormField label="Last Name" htmlFor="profile-lastName" required error={lastNameError}>
              <Input id="profile-lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </FormField>

            <FormField label="Email" htmlFor="profile-email" helperText="Email cannot be changed here.">
              <Input id="profile-email" value={user.email} disabled />
            </FormField>

            <FormField label="Phone" htmlFor="profile-phone">
              <Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </FormField>

            <FormField label="Role" htmlFor="profile-role" helperText="Role is managed by an administrator.">
              <Input id="profile-role" value={user.role} disabled />
            </FormField>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
