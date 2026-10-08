import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createEnrollment, getEnrollment, updateEnrollment } from '../../api/enrollmentApi'
import { getStudents } from '../../api/studentApi'
import { getCourses } from '../../api/courseApi'
import type { Course, Student } from '../../types'
import { validateDate, validateNumeric, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  studentId: string
  courseId: string
  enrollmentDate: string
  semester: string
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  studentId: '',
  courseId: '',
  enrollmentDate: '',
  semester: '1',
  status: 'ACTIVE',
}

export default function EnrollmentForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getStudents({ page: 0, limit: 200 }).then((response) => setStudents(response.data)).catch(() => undefined)
    getCourses({ page: 0, limit: 200 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getEnrollment(id)
      .then((enrollment) => {
        setForm({
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          enrollmentDate: enrollment.enrollmentDate?.slice(0, 10) ?? '',
          semester: String(enrollment.semester),
          status: enrollment.status,
        })
      })
      .catch(() => toast.error('Unable to load enrollment record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      studentId: validateRequired(form.studentId, 'Student'),
      courseId: validateRequired(form.courseId, 'Course'),
      enrollmentDate: validateDate(form.enrollmentDate, 'Enrollment date'),
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
      const payload = { ...form, semester: Number(form.semester) }
      if (isEditMode && id) {
        await updateEnrollment(id, payload)
        toast.success('Enrollment updated successfully.')
      } else {
        await createEnrollment(payload)
        toast.success('Enrollment created successfully.')
      }
      navigate(ROUTES.ENROLLMENTS)
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading enrollment record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Enrollment' : 'Add Enrollment'} />

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Student" htmlFor="studentId" required error={errorsToShow.studentId}>
            <Select id="studentId" value={form.studentId} onChange={(event) => updateField('studentId', event.target.value)}>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.studentId})
                </option>
              ))}
            </Select>
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

          <FormField label="Enrollment Date" htmlFor="enrollmentDate" required error={errorsToShow.enrollmentDate}>
            <Input
              id="enrollmentDate"
              type="date"
              value={form.enrollmentDate}
              onChange={(event) => updateField('enrollmentDate', event.target.value)}
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
            {isEditMode ? 'Save Changes' : 'Create Enrollment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
