import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { getCourses } from '../../api/courseApi'
import { getEnrollments } from '../../api/enrollmentApi'
import {
  createAttendanceRecord,
  getAttendanceRecords,
  getStudentAttendance,
} from '../../api/attendanceApi'
import type { AttendanceStatus, Course, Enrollment } from '../../types'
import PageHeader from '../../components/common/PageHeader'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Badge, { statusToTone } from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters'
import { useListQuery } from '../../hooks/useListQuery'
import { DEFAULT_PAGE_SIZE } from '../../constants/routes'

const statusOptions: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

interface DraftRow {
  studentId: string
  studentName: string
  status: AttendanceStatus
  remarks: string
}

function TeacherAttendanceMarking() {
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [draftRows, setDraftRows] = useState<DraftRow[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!courseId) {
      setDraftRows([])
      return
    }
    setLoadingStudents(true)
    getEnrollments({ courseId, status: 'ACTIVE', page: 0, limit: 200 })
      .then((response) => {
        setDraftRows(
          response.data.map((enrollment: Enrollment) => ({
            studentId: enrollment.studentId,
            studentName: enrollment.studentName ?? enrollment.studentId,
            status: 'PRESENT' as AttendanceStatus,
            remarks: '',
          })),
        )
      })
      .catch(() => setDraftRows([]))
      .finally(() => setLoadingStudents(false))
  }, [courseId])

  function updateRow(studentId: string, patch: Partial<DraftRow>) {
    setDraftRows((rows) => rows.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)))
  }

  async function handleSave() {
    if (!courseId || draftRows.length === 0) return
    setSaving(true)
    try {
      await Promise.all(
        draftRows.map((row) =>
          createAttendanceRecord({
            studentId: row.studentId,
            courseId,
            date,
            status: row.status,
            remarks: row.remarks,
          }),
        ),
      )
      toast.success('Attendance saved successfully.')
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Course</label>
          <Select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="min-w-[220px]">
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseCode} — {course.courseName}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>

        <Button onClick={handleSave} loading={saving} disabled={!courseId || draftRows.length === 0}>
          Save Attendance
        </Button>
      </div>

      {!courseId && <p className="text-sm text-muted">Select a course to view enrolled students.</p>}

      {courseId && loadingStudents && <p className="text-sm text-muted">Loading enrolled students...</p>}

      {courseId && !loadingStudents && draftRows.length === 0 && (
        <p className="text-sm text-muted">No active enrollments found for this course.</p>
      )}

      {courseId && !loadingStudents && draftRows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {draftRows.map((row) => (
                <tr key={row.studentId}>
                  <td className="px-4 py-3">{row.studentName}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={row.status}
                      onChange={(event) => updateRow(row.studentId, { status: event.target.value as AttendanceStatus })}
                      className="max-w-[150px]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.remarks}
                      onChange={(event) => updateRow(row.studentId, { remarks: event.target.value })}
                      placeholder="Optional remarks"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AttendanceReadOnlyView({ scopeToOwnRecords }: { scopeToOwnRecords: boolean }) {
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('')
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  // MOCK: assumes the authenticated user's id matches the backend's
  // studentId for the /students/{studentId}/attendance endpoint — verify
  // this mapping (it may require a separate "my student profile" lookup)
  // against the real backend.
  const fetcher = scopeToOwnRecords
    ? (params: Parameters<typeof getAttendanceRecords>[0]) => getStudentAttendance(user?.id ?? '', params)
    : getAttendanceRecords

  const { items, loading, error, reload } = useListQuery(fetcher, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    courseId: courseId || undefined,
    status: status || undefined,
  })

  useEffect(() => {
    setPage(0)
  }, [courseId, status])

  const presentCount = items.filter((record) => record.status === 'PRESENT').length
  const attendancePercentage = items.length > 0 ? Math.round((presentCount / items.length) * 100) : 0

  const columns: DataTableColumn<(typeof items)[number]>[] = [
    ...(scopeToOwnRecords ? [] : [{ header: 'Student', render: (record: (typeof items)[number]) => record.studentName ?? '-' }]),
    { header: 'Course', render: (record) => record.courseName ?? '-' },
    { header: 'Date', render: (record) => formatDate(record.date) },
    { header: 'Status', render: (record) => <Badge tone={statusToTone(record.status)}>{record.status}</Badge> },
    { header: 'Remarks', render: (record) => record.remarks || '-' },
  ]

  return (
    <div>
      {scopeToOwnRecords && (
        <div className="mb-4 rounded-card border border-border bg-card p-4 shadow-card">
          <p className="text-sm text-muted">Overall Attendance</p>
          <p className="text-2xl font-semibold text-gray-900">{attendancePercentage}%</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="max-w-[200px]">
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseCode} — {course.courseName}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-[150px]">
          <option value="">All Statuses</option>
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(record) => record.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No attendance records found."
      />
    </div>
  )
}

export default function AttendancePage() {
  const { role } = useAuth()

  return (
    <div>
      <PageHeader
        title="Attendance"
        description={
          role === 'TEACHER'
            ? 'Mark attendance for your course sections.'
            : role === 'STUDENT'
              ? 'View your attendance history.'
              : 'Review attendance across the institution.'
        }
      />

      {role === 'TEACHER' && <TeacherAttendanceMarking />}
      {role === 'STUDENT' && <AttendanceReadOnlyView scopeToOwnRecords />}
      {role === 'ADMIN' && <AttendanceReadOnlyView scopeToOwnRecords={false} />}
    </div>
  )
}
