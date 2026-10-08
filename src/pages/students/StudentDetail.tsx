import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getStudent } from '../../api/studentApi'
import { getEnrollments } from '../../api/enrollmentApi'
import { getStudentAttendance } from '../../api/attendanceApi'
import { getGrades } from '../../api/gradeApi'
import { getAssignments } from '../../api/assignmentApi'
import type { Assignment, Attendance, Enrollment, Grade, Student } from '../../types'
import Button from '../../components/common/Button'
import Badge, { statusToTone } from '../../components/common/Badge'
import { SkeletonLine } from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { formatDate, formatFullName } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../contexts/AuthContext'

type TabKey = 'courses' | 'attendance' | 'grades' | 'assignments'

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabKey>('courses')

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getStudent(id)
      .then(setStudent)
      .catch(() => setError('Unable to load student details.'))
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
      courses: () =>
        getEnrollments({ studentId: id, page: 0, limit: 50 }).then((response) => setEnrollments(response.data)),
      attendance: () => getStudentAttendance(id, { page: 0, limit: 50 }).then((response) => setAttendance(response.data)),
      grades: () => getGrades({ studentId: id, page: 0, limit: 50 }).then((response) => setGrades(response.data)),
      assignments: () => getAssignments({ page: 0, limit: 50 }).then((response) => setAssignments(response.data)),
    }

    loaders[tab]()
      .catch(() => {
        // Toast already surfaced via the shared interceptor.
      })
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

  if (error || !student) {
    return <ErrorState message={error || 'Student not found.'} onRetry={load} />
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'courses', label: 'Courses' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'grades', label: 'Grades' },
    { key: 'assignments', label: 'Assignments' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
          <ArrowLeft size={16} />
          Back
        </button>
        {role === 'ADMIN' && (
          <Button variant="secondary" onClick={() => navigate(ROUTES.STUDENT_EDIT(student.id))}>
            <Pencil size={16} />
            Edit
          </Button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Personal Information</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="text-gray-800">{formatFullName(student.firstName, student.lastName)}</dd>
            <dt className="text-muted">Student ID</dt>
            <dd className="text-gray-800">{student.studentId}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="text-gray-800">{student.email}</dd>
            <dt className="text-muted">Phone</dt>
            <dd className="text-gray-800">{student.phone}</dd>
            <dt className="text-muted">Date of Birth</dt>
            <dd className="text-gray-800">{formatDate(student.dateOfBirth)}</dd>
            <dt className="text-muted">Gender</dt>
            <dd className="text-gray-800">{student.gender}</dd>
            <dt className="text-muted">Address</dt>
            <dd className="text-gray-800">
              {student.address}, {student.city}, {student.state} {student.postalCode}
            </dd>
          </dl>
        </section>

        <section className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Academic Information</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Department</dt>
            <dd className="text-gray-800">{student.departmentName ?? '-'}</dd>
            <dt className="text-muted">Semester</dt>
            <dd className="text-gray-800">{student.semester}</dd>
            <dt className="text-muted">Admission Date</dt>
            <dd className="text-gray-800">{formatDate(student.admissionDate)}</dd>
            <dt className="text-muted">Status</dt>
            <dd>
              <Badge tone={statusToTone(student.status)}>{student.status}</Badge>
            </dd>
          </dl>
        </section>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card">
        <div className="flex gap-1 border-b border-border px-4">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
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
              {tab === 'courses' &&
                (enrollments.length === 0 ? (
                  <EmptyState title="No enrolled courses." />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {enrollments.map((enrollment) => (
                      <li key={enrollment.id} className="flex items-center justify-between py-2">
                        <span>{enrollment.courseName}</span>
                        <Badge tone={statusToTone(enrollment.status)}>{enrollment.status}</Badge>
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
                          {record.courseName} — {formatDate(record.date)}
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
                        <span>{grade.courseName}</span>
                        <span className="font-medium text-gray-800">
                          {grade.marks}/{grade.maxMarks} ({grade.grade})
                        </span>
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
                        <span>{assignment.title}</span>
                        <Badge tone={statusToTone(assignment.status)}>{assignment.status}</Badge>
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
