import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, CalendarClock, FileText } from 'lucide-react'
import { getTeacherDashboard } from '../../api/dashboardApi'
import type { TeacherDashboard as TeacherDashboardData } from '../../types'
import PageHeader from '../../components/common/PageHeader'
import SummaryCard from '../../components/dashboard/SummaryCard'
import ErrorState from '../../components/common/ErrorState'
import Badge, { statusToTone } from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getTeacherDashboard()
      .then(setData)
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (!loading && error) {
    return <ErrorState message={error} onRetry={load} />
  }

  return (
    <div>
      <PageHeader title="Teacher Dashboard" description="Your courses, classes, and pending work." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Assigned Courses" value={data?.assignedCourses.length ?? 0} icon={BookOpen} loading={loading} />
        <SummaryCard label="Total Students" value={data?.totalStudents ?? 0} icon={GraduationCap} loading={loading} tone="accent" />
        <SummaryCard label="Today's Classes" value={data?.todaysClasses.length ?? 0} icon={CalendarClock} loading={loading} tone="success" />
        <SummaryCard label="Pending Assignments" value={data?.pendingAssignments.length ?? 0} icon={FileText} loading={loading} tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Assigned Courses</h3>
          <ul className="divide-y divide-border">
            {(data?.assignedCourses ?? []).map((course) => (
              <li
                key={course.id}
                onClick={() => navigate(ROUTES.COURSE_DETAIL(course.id))}
                className="cursor-pointer py-2 text-sm text-gray-700 hover:text-primary"
              >
                {course.courseCode} — {course.courseName}
              </li>
            ))}
            {!loading && (data?.assignedCourses ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No assigned courses.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Today's Classes</h3>
          <ul className="divide-y divide-border">
            {(data?.todaysClasses ?? []).map((schoolClass) => (
              <li key={schoolClass.id} className="py-2 text-sm text-gray-700">
                {schoolClass.className} — Room {schoolClass.room} ({schoolClass.startTime}-{schoolClass.endTime})
              </li>
            ))}
            {!loading && (data?.todaysClasses ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No classes scheduled today.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Pending Assignments</h3>
          <ul className="divide-y divide-border">
            {(data?.pendingAssignments ?? []).map((assignment) => (
              <li
                key={assignment.id}
                onClick={() => navigate(ROUTES.ASSIGNMENTS)}
                className="cursor-pointer py-2 text-sm text-gray-700 hover:text-primary"
              >
                {assignment.title} — due {formatDate(assignment.dueDate)}
              </li>
            ))}
            {!loading && (data?.pendingAssignments ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No pending assignments.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Attendance</h3>
          <ul className="divide-y divide-border">
            {(data?.recentAttendance ?? []).map((record) => (
              <li key={record.id} className="flex items-center justify-between py-2 text-sm text-gray-700">
                <span>
                  {record.studentName} — {formatDate(record.date)}
                </span>
                <Badge tone={statusToTone(record.status)}>{record.status}</Badge>
              </li>
            ))}
            {!loading && (data?.recentAttendance ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No recent attendance records.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
