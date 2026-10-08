import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createTeacher, getTeacher, updateTeacher } from '../../api/teacherApi'
import { getDepartments } from '../../api/departmentApi'
import type { Department } from '../../types'
import { validateDate, validateEmail, validatePhone, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  departmentId: string
  specialization: string
  joiningDate: string
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  specialization: '',
  joiningDate: '',
  status: 'ACTIVE',
}

export default function TeacherForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 })
      .then((response) => setDepartments(response.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getTeacher(id)
      .then((teacher) => {
        setForm({
          employeeId: teacher.employeeId,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          departmentId: teacher.departmentId,
          specialization: teacher.specialization,
          joiningDate: teacher.joiningDate?.slice(0, 10) ?? '',
          status: teacher.status,
        })
      })
      .catch(() => toast.error('Unable to load teacher record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      employeeId: validateRequired(form.employeeId, 'Employee ID'),
      firstName: validateRequired(form.firstName, 'First name'),
      lastName: validateRequired(form.lastName, 'Last name'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      departmentId: validateRequired(form.departmentId, 'Department'),
      specialization: validateRequired(form.specialization, 'Specialization'),
      joiningDate: validateDate(form.joiningDate, 'Joining date'),
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
        await updateTeacher(id, form)
        toast.success('Teacher updated successfully.')
        navigate(ROUTES.TEACHER_DETAIL(id))
      } else {
        const created = await createTeacher(form)
        toast.success('Teacher created successfully.')
        navigate(ROUTES.TEACHER_DETAIL(created.id))
      }
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading teacher record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Teacher' : 'Add Teacher'} />

      <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Employee ID" htmlFor="employeeId" required error={errorsToShow.employeeId}>
            <Input id="employeeId" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} />
          </FormField>

          <FormField label="First Name" htmlFor="firstName" required error={errorsToShow.firstName}>
            <Input id="firstName" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </FormField>

          <FormField label="Last Name" htmlFor="lastName" required error={errorsToShow.lastName}>
            <Input id="lastName" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </FormField>

          <FormField label="Email" htmlFor="email" required error={errorsToShow.email}>
            <Input id="email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </FormField>

          <FormField label="Phone" htmlFor="phone" required error={errorsToShow.phone}>
            <Input id="phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </FormField>

          <FormField label="Department" htmlFor="departmentId" required error={errorsToShow.departmentId}>
            <Select
              id="departmentId"
              value={form.departmentId}
              onChange={(event) => updateField('departmentId', event.target.value)}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Specialization" htmlFor="specialization" required error={errorsToShow.specialization}>
            <Input
              id="specialization"
              value={form.specialization}
              onChange={(event) => updateField('specialization', event.target.value)}
            />
          </FormField>

          <FormField label="Joining Date" htmlFor="joiningDate" required error={errorsToShow.joiningDate}>
            <Input
              id="joiningDate"
              type="date"
              value={form.joiningDate}
              onChange={(event) => updateField('joiningDate', event.target.value)}
            />
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
            {isEditMode ? 'Save Changes' : 'Create Teacher'}
          </Button>
        </div>
      </form>
    </div>
  )
}
