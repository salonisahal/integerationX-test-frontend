import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClass, getClassById, updateClass } from '../../api/classApi'
import { getCourses } from '../../api/courseApi'
import { getTeachers } from '../../api/teacherApi'
import type { Course, Teacher } from '../../types'
import { validateNumeric, validateRequired } from '../../validation/validators'
import PageHeader from '../../components/common/PageHeader'
import FormField from '../../components/common/FormField'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { ROUTES } from '../../constants/routes'

interface FormState {
  className: string
  courseId: string
  teacherId: string
  room: string
  day: string
  startTime: string
  endTime: string
  semester: string
  status: 'ACTIVE' | 'INACTIVE'
}

const emptyForm: FormState = {
  className: '',
  courseId: '',
  teacherId: '',
  room: '',
  day: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  semester: '1',
  status: 'ACTIVE',
}

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function ClassForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
    getTeachers({ page: 0, limit: 100 }).then((response) => setTeachers(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getClassById(id)
      .then((schoolClass) => {
        setForm({
          className: schoolClass.className,
          courseId: schoolClass.courseId,
          teacherId: schoolClass.teacherId,
          room: schoolClass.room,
          day: schoolClass.day,
          startTime: schoolClass.startTime,
          endTime: schoolClass.endTime,
          semester: String(schoolClass.semester),
          status: schoolClass.status,
        })
      })
      .catch(() => toast.error('Unable to load class record.'))
      .finally(() => setLoading(false))
  }, [id])

  function runValidation(): Record<string, string> {
    return {
      className: validateRequired(form.className, 'Class name'),
      courseId: validateRequired(form.courseId, 'Course'),
      teacherId: validateRequired(form.teacherId, 'Teacher'),
      room: validateRequired(form.room, 'Room'),
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
        await updateClass(id, payload)
        toast.success('Class updated successfully.')
      } else {
        await createClass(payload)
        toast.success('Class created successfully.')
      }
      navigate(ROUTES.CLASSES)
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading class record...</p>
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader title={isEditMode ? 'Edit Class' : 'Add Class'} />

      <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Class Name" htmlFor="className" required error={errorsToShow.className}>
            <Input id="className" value={form.className} onChange={(event) => updateField('className', event.target.value)} />
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

          <FormField label="Teacher" htmlFor="teacherId" required error={errorsToShow.teacherId}>
            <Select id="teacherId" value={form.teacherId} onChange={(event) => updateField('teacherId', event.target.value)}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Room" htmlFor="room" required error={errorsToShow.room}>
            <Input id="room" value={form.room} onChange={(event) => updateField('room', event.target.value)} />
          </FormField>

          <FormField label="Day" htmlFor="day">
            <Select id="day" value={form.day} onChange={(event) => updateField('day', event.target.value)}>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
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

          <FormField label="Start Time" htmlFor="startTime">
            <Input id="startTime" type="time" value={form.startTime} onChange={(event) => updateField('startTime', event.target.value)} />
          </FormField>

          <FormField label="End Time" htmlFor="endTime">
            <Input id="endTime" type="time" value={form.endTime} onChange={(event) => updateField('endTime', event.target.value)} />
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
            {isEditMode ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </form>
    </div>
  )
}
