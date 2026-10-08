import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getCourse } from '../../api/courseApi'
import { getEnrollments } from '../../api/enrollmentApi'
import { getClasses } from '../../api/classApi'
import { getAssignments } from '../../api/assignmentApi'
import { getCourseAttendance } from '../../api/attendanceApi'
import { getGrades } from '../../api/gradeApi'
import type { Assignment, Attendance, Course, Enrollment, Grade, SchoolClass } from '../../types'
import Button from '../../components/common/Button'
import Badge, { statusToTone } from '../../components/common/Badge'
import { SkeletonLine } from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../contexts/AuthContext'

type TabKey = 'students' | 'classes' | 'assignments' | 'attendance' | 'grades'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabKey>('students')
  const [tabLoading, setTabLoading] = useState(false)

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getCourse(id)
      .then(setCourse)
      .catch(() => setError('Unable to load course details.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!id) return
    setTabLoading(true)

    const loaders: Record<TabKey, () => Promise<void>> = {
      students: () => getEnrollments({ courseId: id, page: 0, limit: 50 }).then((response) => setEnrollments(response.data)),
      classes: () => getClasses({ courseId: id, page: 0, limit: 50 }).then((response) => setClasses(response.data)),
      assignments: () => getAssignments({ courseId: id, page: 0, limit: 50 }).then((response) => setAssignments(response.data)),
      attendance: () => getCourseAttendance(id, { page: 0, limit: 50 }).then((response) => setAttendance(response.data)),
      grades: () => getGrades({ courseId: id, page: 0, limit: 50 }).then((response) => setGrades(response.data)),
    }

    loaders[tab]()
      .catch(() => undefined)
      .finally(() => setTabLoading(false))
  }, [tab, id])

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine className="h-6 w-40" />
        <SkeletonLine className="h-40 w-full" />
      </div>
    )
  }

  if (error || !course) {
    return <ErrorState message={error || 'Course not found.'} onRetry={load} />
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'students', label: 'Students' },
    { key: 'classes', label: 'Classes' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'grades', label: 'Grades' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
          <ArrowLeft size={16} />
          Back
        </button>
        {role === 'ADMIN' && (
          <Button variant="secondary" onClick={() => navigate(ROUTES.COURSE_EDIT(course.id))}>
            <Pencil size={16} />
            Edit
          </Button>
        )}
      </div>

      <section className="mb-6 rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Course Information</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
          <dt className="text-muted">Code</dt>
          <dd className="col-span-2 text-gray-800">{course.courseCode}</dd>
          <dt className="text-muted">Name</dt>
          <dd className="col-span-2 text-gray-800">{course.courseName}</dd>
          <dt className="text-muted">Description</dt>
          <dd className="col-span-2 text-gray-800">{course.description}</dd>
          <dt className="text-muted">Credits</dt>
          <dd className="col-span-2 text-gray-800">{course.credits}</dd>
          <dt className="text-muted">Department</dt>
          <dd className="col-span-2 text-gray-800">{course.departmentName ?? '-'}</dd>
          <dt className="text-muted">Assigned Teacher</dt>
          <dd className="col-span-2 text-gray-800">{course.teacherName ?? '-'}</dd>
          <dt className="text-muted">Semester</dt>
          <dd className="col-span-2 text-gray-800">{course.semester}</dd>
          <dt className="text-muted">Status</dt>
          <dd className="col-span-2">
            <Badge tone={statusToTone(course.status)}>{course.status}</Badge>
          </dd>
        </dl>
      </section>

      <div className="rounded-card border border-border bg-card shadow-card">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                tab === tabItem.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tabLoading ? (
            <SkeletonLine className="h-24 w-full" />
          ) : (
            <>
              {tab === 'students' &&
                (enrollments.length === 0 ? (
                  <EmptyState title="No students enrolled." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {enrollments.map((enrollment) => (
                      <li key={enrollment.id} className="flex items-center justify-between py-2">
                        <span>{enrollment.studentName}</span>
                        <Badge tone={statusToTone(enrollment.status)}>{enrollment.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'classes' &&
                (classes.length === 0 ? (
                  <EmptyState title="No classes scheduled." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {classes.map((schoolClass) => (
                      <li key={schoolClass.id} className="py-2">
                        {schoolClass.className} — {schoolClass.day} {schoolClass.startTime}-{schoolClass.endTime} (Room{' '}
                        {schoolClass.room})
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'assignments' &&
                (assignments.length === 0 ? (
                  <EmptyState title="No assignments found." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {assignments.map((assignment) => (
                      <li key={assignment.id} className="flex items-center justify-between py-2">
                        <span>
                          {assignment.title} — due {formatDate(assignment.dueDate)}
                        </span>
                        <Badge tone={statusToTone(assignment.status)}>{assignment.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'attendance' &&
                (attendance.length === 0 ? (
                  <EmptyState title="No attendance records." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {attendance.map((record) => (
                      <li key={record.id} className="flex items-center justify-between py-2">
                        <span>
                          {record.studentName} — {formatDate(record.date)}
                        </span>
                        <Badge tone={statusToTone(record.status)}>{record.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'grades' &&
                (grades.length === 0 ? (
                  <EmptyState title="No grades recorded." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {grades.map((grade) => (
                      <li key={grade.id} className="flex items-center justify-between py-2">
                        <span>{grade.studentName}</span>
                        <span className="font-medium text-gray-800">
                          {grade.marks}/{grade.maxMarks} ({grade.grade})
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
