import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createAssignment, getAssignment, updateAssignment } from '../../api/assignmentApi'
import { getCourses } from '../../api/courseApi'
import type { Course } from '../../types'
import { validateDate, validateNumeric, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  title: string
  description: string
  courseId: string
  dueDate: string
  maxMarks: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
}

const emptyForm: FormState = {
  title: '',
  description: '',
  courseId: '',
  dueDate: '',
  maxMarks: '100',
  status: 'DRAFT',
}

export default function AssignmentForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAssignment(id)
      .then((assignment) => {
        setForm({
          title: assignment.title,
          description: assignment.description,
          courseId: assignment.courseId,
          dueDate: assignment.dueDate?.slice(0, 10) ?? '',
          maxMarks: String(assignment.maxMarks),
          status: assignment.status,
        })
      })
      .catch(() => toast.error('Unable to load assignment record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      title: validateRequired(form.title, 'Title'),
      description: validateRequired(form.description, 'Description'),
      courseId: validateRequired(form.courseId, 'Course'),
      dueDate: validateDate(form.dueDate, 'Due date'),
      maxMarks: validateNumeric(form.maxMarks, 'Maximum marks'),
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
      const payload = { ...form, maxMarks: Number(form.maxMarks) }
      if (isEditMode && id) {
        await updateAssignment(id, payload)
        toast.success('Assignment updated successfully.')
      } else {
        await createAssignment(payload)
        toast.success('Assignment created successfully.')
      }
      navigate(ROUTES.ASSIGNMENTS)
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading assignment record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Assignment' : 'Add Assignment'} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required error={errorsToShow.title}>
            <Input id="title" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </FormField>

          <FormField label="Course" htmlFor="courseId" required error={errorsToShow.courseId}>
            <Select id="courseId" value={form.courseId} onChange={(event) => updateField('courseId', event.target.value)}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} — {course.courseName}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Due Date" htmlFor="dueDate" required error={errorsToShow.dueDate}>
            <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
          </FormField>

          <FormField label="Maximum Marks" htmlFor="maxMarks" required error={errorsToShow.maxMarks}>
            <Input id="maxMarks" type="number" value={form.maxMarks} onChange={(event) => updateField('maxMarks', event.target.value)} />
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select
              id="status"
              value={form.status}
              onChange={(event) => updateField('status', event.target.value as 'DRAFT' | 'PUBLISHED' | 'CLOSED')}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Description" htmlFor="description" required error={errorsToShow.description}>
              <Textarea id="description" rows={3} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
