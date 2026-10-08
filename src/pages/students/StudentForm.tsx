import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createStudent, getStudent, updateStudent } from '../../api/studentApi'
import { getDepartments } from '../../api/departmentApi'
import type { Department } from '../../types'
import {
  validateDate,
  validateEmail,
  validateNumeric,
  validatePhone,
  validateRequired,
} from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { ROUTES } from '../../constants/routes'

interface FormState {
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  state: string
  postalCode: string
  departmentId: string
  admissionDate: string
  semester: string
  status: 'ACTIVE' | 'INACTIVE'
  profileImageUrl: string
}

const emptyForm: FormState = {
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  departmentId: '',
  admissionDate: '',
  semester: '1',
  status: 'ACTIVE',
  profileImageUrl: '',
}

export default function StudentForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 })
      .then((response) => setDepartments(response.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getStudent(id)
      .then((student) => {
        setForm({
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phone: student.phone,
          dateOfBirth: student.dateOfBirth?.slice(0, 10) ?? '',
          gender: student.gender,
          address: student.address,
          city: student.city,
          state: student.state,
          postalCode: student.postalCode,
          departmentId: student.departmentId,
          admissionDate: student.admissionDate?.slice(0, 10) ?? '',
          semester: String(student.semester),
          status: student.status,
          profileImageUrl: student.profileImageUrl ?? '',
        })
      })
      .catch(() => toast.error('Unable to load student record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      studentId: validateRequired(form.studentId, 'Student ID'),
      firstName: validateRequired(form.firstName, 'First name'),
      lastName: validateRequired(form.lastName, 'Last name'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      dateOfBirth: validateDate(form.dateOfBirth, 'Date of birth'),
      address: validateRequired(form.address, 'Address'),
      city: validateRequired(form.city, 'City'),
      state: validateRequired(form.state, 'State'),
      postalCode: validateRequired(form.postalCode, 'Postal code'),
      departmentId: validateRequired(form.departmentId, 'Department'),
      admissionDate: validateDate(form.admissionDate, 'Admission date'),
      semester: validateNumeric(form.semester, 'Semester'),
    }
  }

  const liveErrors = runValidation()
  const isValid = Object.values(liveErrors).every((message) => message === '')

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    const errors = runValidation()
    setFieldErrors(errors)
    if (Object.values(errors).some((message) => message !== '')) return

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        semester: Number(form.semester),
      }

      if (isEditMode && id) {
        await updateStudent(id, payload)
        toast.success('Student updated successfully.')
        navigate(ROUTES.STUDENT_DETAIL(id))
      } else {
        const created = await createStudent(payload)
        toast.success('Student created successfully.')
        navigate(ROUTES.STUDENT_DETAIL(created.id))
      }
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading student record...</p>
  }

  const errorsToShow = submitted ? fieldErrors : {}

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Student' : 'Add Student'} />

      <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Student ID" htmlFor="studentId" required error={errorsToShow.studentId}>
            <Input id="studentId" value={form.studentId} onChange={(event) => updateField('studentId', event.target.value)} />
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

          <FormField label="Phone" htmlFor="phone" required error={errorsToShow.phone} helperText="Digits, spaces, and + - ( ) allowed">
            <Input id="phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </FormField>

          <FormField label="Date of Birth" htmlFor="dateOfBirth" required error={errorsToShow.dateOfBirth}>
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => updateField('dateOfBirth', event.target.value)}
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender">
            <Select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormField>

          <FormField label="Address" htmlFor="address" required error={errorsToShow.address}>
            <Input id="address" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </FormField>

          <FormField label="City" htmlFor="city" required error={errorsToShow.city}>
            <Input id="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} />
          </FormField>

          <FormField label="State" htmlFor="state" required error={errorsToShow.state}>
            <Input id="state" value={form.state} onChange={(event) => updateField('state', event.target.value)} />
          </FormField>

          <FormField label="Postal Code" htmlFor="postalCode" required error={errorsToShow.postalCode}>
            <Input id="postalCode" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} />
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

          <FormField label="Admission Date" htmlFor="admissionDate" required error={errorsToShow.admissionDate}>
            <Input
              id="admissionDate"
              type="date"
              value={form.admissionDate}
              onChange={(event) => updateField('admissionDate', event.target.value)}
            />
          </FormField>

          <FormField label="Semester" htmlFor="semester" required error={errorsToShow.semester}>
            <Select id="semester" value={form.semester} onChange={(event) => updateField('semester', event.target.value)}>
              {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  Semester {value}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select
              id="status"
              value={form.status}
              onChange={(event) => updateField('status', event.target.value as 'ACTIVE' | 'INACTIVE')}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>

          <FormField label="Profile Image URL" htmlFor="profileImageUrl" helperText="Optional link to a profile photo">
            <Input
              id="profileImageUrl"
              value={form.profileImageUrl}
              onChange={(event) => updateField('profileImageUrl', event.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitted && !isValid}>
            {isEditMode ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </form>
    </div>
  )
}
