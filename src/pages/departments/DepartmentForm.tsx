import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createDepartment, getDepartment, updateDepartment } from '../../api/departmentApi'
import { validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  name: string
  code: string
  description: string
  departmentHeadName: string
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  name: '',
  code: '',
  description: '',
  departmentHeadName: '',
  status: 'ACTIVE',
}

export default function DepartmentForm() {
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
    getDepartment(id)
      .then((department) => {
        setForm({
          name: department.name,
          code: department.code,
          description: department.description,
          departmentHeadName: department.departmentHeadName ?? '',
          status: department.status,
        })
      })
      .catch(() => toast.error('Unable to load department record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      name: validateRequired(form.name, 'Department name'),
      code: validateRequired(form.code, 'Department code'),
      description: validateRequired(form.description, 'Description'),
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
        await updateDepartment(id, form)
        toast.success('Department updated successfully.')
      } else {
        await createDepartment(form)
        toast.success('Department created successfully.')
      }
      navigate(ROUTES.DEPARTMENTS)
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading department record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Department' : 'Add Department'} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required error={errorsToShow.name}>
            <Input id="name" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </FormField>

          <FormField label="Code" htmlFor="code" required error={errorsToShow.code}>
            <Input id="code" value={form.code} onChange={(event) => updateField('code', event.target.value)} />
          </FormField>

          <FormField label="Department Head" htmlFor="departmentHeadName">
            <Input
              id="departmentHeadName"
              value={form.departmentHeadName}
              onChange={(event) => updateField('departmentHeadName', event.target.value)}
            />
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(event) => updateField('status', event.target.value as 'ACTIVE' | 'INACTIVE')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Description" htmlFor="description" required error={errorsToShow.description}>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </form>
    </div>
  )
}
