import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createCourse, getCourse, updateCourse } from '../../api/courseApi'
import { getDepartments } from '../../api/departmentApi'
import { getTeachers } from '../../api/teacherApi'
import type { Department, Teacher } from '../../types'
import { validateNumeric, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  courseCode: string
  courseName: string
  description: string
  credits: string
  departmentId: string
  teacherId: string
  semester: string
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  courseCode: '',
  courseName: '',
  description: '',
  credits: '3',
  departmentId: '',
  teacherId: '',
  semester: '1',
  status: 'ACTIVE',
}

export default function CourseForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [departments, setDepartments] = useState<Department[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 }).then((response) => setDepartments(response.data)).catch(() => undefined)
    getTeachers({ page: 0, limit: 100 }).then((response) => setTeachers(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCourse(id)
      .then((course) => {
        setForm({
          courseCode: course.courseCode,
          courseName: course.courseName,
          description: course.description,
          credits: String(course.credits),
          departmentId: course.departmentId,
          teacherId: course.teacherId ?? '',
          semester: String(course.semester),
          status: course.status,
        })
      })
      .catch(() => toast.error('Unable to load course record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      courseCode: validateRequired(form.courseCode, 'Course code'),
      courseName: validateRequired(form.courseName, 'Course name'),
      description: validateRequired(form.description, 'Description'),
      credits: validateNumeric(form.credits, 'Credits'),
      departmentId: validateRequired(form.departmentId, 'Department'),
      semester: validateNumeric(form.semester, 'Semester'),
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
      const payload = { ...form, credits: Number(form.credits), semester: Number(form.semester) }
      if (isEditMode && id) {
        await updateCourse(id, payload)
        toast.success('Course updated successfully.')
        navigate(ROUTES.COURSE_DETAIL(id))
      } else {
        const created = await createCourse(payload)
        toast.success('Course created successfully.')
        navigate(ROUTES.COURSE_DETAIL(created.id))
      }
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading course record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Course' : 'Add Course'} />

      <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Course Code" htmlFor="courseCode" required error={errorsToShow.courseCode}>
            <Input id="courseCode" value={form.courseCode} onChange={(event) => updateField('courseCode', event.target.value)} />
          </FormField>

          <FormField label="Course Name" htmlFor="courseName" required error={errorsToShow.courseName}>
            <Input id="courseName" value={form.courseName} onChange={(event) => updateField('courseName', event.target.value)} />
          </FormField>

          <FormField label="Credits" htmlFor="credits" required error={errorsToShow.credits}>
            <Input id="credits" type="number" min={1} max={6} value={form.credits} onChange={(event) => updateField('credits', event.target.value)} />
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

          <FormField label="Department" htmlFor="departmentId" required error={errorsToShow.departmentId}>
            <Select id="departmentId" value={form.departmentId} onChange={(event) => updateField('departmentId', event.target.value)}>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Teacher" htmlFor="teacherId">
            <Select id="teacherId" value={form.teacherId} onChange={(event) => updateField('teacherId', event.target.value)}>
              <option value="">Unassigned</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(event) => updateField('status', event.target.value as 'ACTIVE' | 'INACTIVE')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
            {isEditMode ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  )
}
