import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, Building2, UserCheck, UserX } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAdminDashboard } from '../../api/dashboardApi'
import type { AdminDashboard as AdminDashboardData } from '../../types'
import PageHeader from '../../components/common/PageHeader'
import SummaryCard from '../../components/dashboard/SummaryCard'
import ChartCard from '../../components/dashboard/ChartCard'
import ErrorState from '../../components/common/ErrorState'
import { formatDate } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'

const PIE_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getAdminDashboard()
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
      <PageHeader title="Admin Dashboard" description="Overview of the entire institution." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Students" value={data?.totalStudents ?? 0} icon={GraduationCap} loading={loading} />
        <SummaryCard label="Total Teachers" value={data?.totalTeachers ?? 0} icon={Users} loading={loading} tone="accent" />
        <SummaryCard label="Total Courses" value={data?.totalCourses ?? 0} icon={BookOpen} loading={loading} />
        <SummaryCard label="Departments" value={data?.totalDepartments ?? 0} icon={Building2} loading={loading} tone="accent" />
        <SummaryCard label="Active Students" value={data?.activeStudents ?? 0} icon={UserCheck} loading={loading} tone="success" />
        <SummaryCard label="Inactive Students" value={data?.inactiveStudents ?? 0} icon={UserX} loading={loading} tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Student Status Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.studentStatusDistribution ?? []}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
              >
                {(data?.studentStatusDistribution ?? []).map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance Overview" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.attendanceOverview ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Course Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.courseDistribution ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Enrollment Trends" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.enrollmentTrends ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recently Added Students</h3>
          <ul className="divide-y divide-border">
            {(data?.recentStudents ?? []).map((student) => (
              <li
                key={student.id}
                onClick={() => navigate(ROUTES.STUDENT_DETAIL(student.id))}
                className="cursor-pointer py-2 text-sm text-gray-700 hover:text-primary"
              >
                {student.firstName} {student.lastName} — {formatDate(student.admissionDate)}
              </li>
            ))}
            {!loading && (data?.recentStudents ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No recent students.</li>
            )}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Notifications</h3>
          <ul className="divide-y divide-border">
            {(data?.recentNotifications ?? []).map((notification) => (
              <li key={notification.id} className="py-2 text-sm text-gray-700">
                {notification.title} — {formatDate(notification.createdAt)}
              </li>
            ))}
            {!loading && (data?.recentNotifications ?? []).length === 0 && (
              <li className="py-2 text-sm text-muted">No recent notifications.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
