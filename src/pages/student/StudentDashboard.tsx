import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarCheck, Award, FileText } from 'lucide-react'
import { getStudentDashboard } from '../../api/dashboardApi'
import type { StudentDashboard as StudentDashboardData } from '../../types'
import PageHeader from '../../components/common/PageHeader'
import SummaryCard from '../../components/dashboard/SummaryCard'
import ErrorState from '../../components/common/ErrorState'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getStudentDashboard()
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
      <PageHeader title="Student Dashboard" description="Your academic overview." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Enrolled Courses" value={data?.enrolledCourses.length ?? 0} icon={BookOpen} loading={loading} />
        <SummaryCard
          label="Attendance %"
          value={data ? `${data.attendancePercentage}%` : '0%'}
          icon={CalendarCheck}
          loading={loading}
          tone="success"
        />
        <SummaryCard label="Average Grade" value={data?.averageGrade ?? '-'} icon={Award} loading={loading} tone="accent" />
        <SummaryCard label="Pending Assignments" value={data?.pendingAssignments.length ?? 0} icon={FileText} loading={loading} tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Enrolled Courses</h3>
          <ul className="divide-y divide-border">
            {(data?.enrolledCourses ?? []).map((course) => (
              <li
                key={course.id}
                onClick={() => navigate(ROUTES.COURSE_DETAIL(course.id))}
                className="cursor-pointer py-2 text-sm text-gray-700 hover:text-primary"
              >
                {course.courseCode} — {course.courseName}
              </li>
            ))}
            {!loading && (data?.enrolledCourses ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No enrolled courses.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Upcoming Classes</h3>
          <ul className="divide-y divide-border">
            {(data?.upcomingClasses ?? []).map((schoolClass) => (
              <li key={schoolClass.id} className="py-2 text-sm text-gray-700">
                {schoolClass.className} — {schoolClass.day} {schoolClass.startTime}-{schoolClass.endTime}
              </li>
            ))}
            {!loading && (data?.upcomingClasses ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No upcoming classes.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Grades</h3>
          <ul className="divide-y divide-border">
            {(data?.recentGrades ?? []).map((grade) => (
              <li key={grade.id} className="py-2 text-sm text-gray-700">
                {grade.courseName} — {grade.marks}/{grade.maxMarks} ({grade.grade})
              </li>
            ))}
            {!loading && (data?.recentGrades ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No recent grades.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Notifications</h3>
          <ul className="divide-y divide-border">
            {(data?.notifications ?? []).map((notification) => (
              <li key={notification.id} className="py-2 text-sm text-gray-700">
                {notification.title} — {formatDate(notification.createdAt)}
              </li>
            ))}
            {!loading && (data?.notifications ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No notifications.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
