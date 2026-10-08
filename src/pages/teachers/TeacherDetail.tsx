import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getTeacher } from '../../api/teacherApi'
import { getCourses } from '../../api/courseApi'
import type { Course, Teacher } from '../../types'
import Button from '../../components/common/Button'
import Badge, { statusToTone } from '../../components/common/Badge'
import { SkeletonLine } from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, formatFullName } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getTeacher(id)
      .then(setTeacher)
      .catch(() => setError('Unable to load teacher details.'))
      .finally(() => setLoading(false))

    getCourses({ teacherId: id, page: 0, limit: 50 })
      .then((response) => setCourses(response.data))
      .catch(() => undefined)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine className="h-6 w-40" />
        <SkeletonLine className="h-40 w-full" />
      </div>
    )
  }

  if (error || !teacher) {
    return <ErrorState message={error || 'Teacher not found.'} onRetry={load} />
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
          <ArrowLeft size={16} />
          Back
        </button>
        <Button variant="secondary" onClick={() => navigate(ROUTES.TEACHER_EDIT(teacher.id))}>
          <Pencil size={16} />
          Edit
        </Button>
      </div>

      <section className="mb-6 rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Teacher Information</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
          <dt className="text-muted">Name</dt>
          <dd className="col-span-2 text-gray-800">{formatFullName(teacher.firstName, teacher.lastName)}</dd>
          <dt className="text-muted">Employee ID</dt>
          <dd className="col-span-2 text-gray-800">{teacher.employeeId}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="col-span-2 text-gray-800">{teacher.email}</dd>
          <dt className="text-muted">Phone</dt>
          <dd className="col-span-2 text-gray-800">{teacher.phone}</dd>
          <dt className="text-muted">Department</dt>
          <dd className="col-span-2 text-gray-800">{teacher.departmentName ?? '-'}</dd>
          <dt className="text-muted">Specialization</dt>
          <dd className="col-span-2 text-gray-800">{teacher.specialization}</dd>
          <dt className="text-muted">Joining Date</dt>
          <dd className="col-span-2 text-gray-800">{formatDate(teacher.joiningDate)}</dd>
          <dt className="text-muted">Status</dt>
          <dd className="col-span-2">
            <Badge tone={statusToTone(teacher.status)}>{teacher.status}</Badge>
          </dd>
        </dl>
      </section>

      <section className="rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Assigned Courses</h3>
        {courses.length === 0 ? (
          <EmptyState title="No assigned courses." />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {courses.map((course) => (
              <li
                key={course.id}
                onClick={() => navigate(ROUTES.COURSE_DETAIL(course.id))}
                className="cursor-pointer py-2 text-gray-700 hover:text-primary"
              >
                {course.courseCode} — {course.courseName}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
