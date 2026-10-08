import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { getCourses } from '../../api/courseApi'
import { getAssignments } from '../../api/assignmentApi'
import { getEnrollments } from '../../api/enrollmentApi'
import { createGrade, getGrades, updateGrade } from '../../api/gradeApi'
import type { Assignment, Course, Enrollment, Grade } from '../../types'
import PageHeader from '../../components/common/PageHeader'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import { useListQuery } from '../../hooks/useListQuery'
import { DEFAULT_PAGE_SIZE } from '../../constants/routes'

interface GradeDraftRow {
  studentId: string
  studentName: string
  existingGradeId?: string
  marks: string
  maxMarks: string
  grade: string
  remarks: string
}

function TeacherGradeEntry() {
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courseId, setCourseId] = useState('')
  const [assignmentId, setAssignmentId] = useState('')
  const [rows, setRows] = useState<GradeDraftRow[]>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!courseId) {
      setAssignments([])
      setAssignmentId('')
      return
    }
    getAssignments({ courseId, page: 0, limit: 100 })
      .then((response) => setAssignments(response.data))
      .catch(() => setAssignments([]))
  }, [courseId])

  useEffect(() => {
    if (!courseId) {
      setRows([])
      return
    }
    setLoadingRows(true)

    Promise.all([
      getEnrollments({ courseId, status: 'ACTIVE', page: 0, limit: 200 }),
      assignmentId ? getGrades({ courseId, assignmentId, page: 0, limit: 200 }) : Promise.resolve({ data: [] as Grade[], page: 0, limit: 0, total: 0 }),
    ])
      .then(([enrollmentResponse, gradeResponse]) => {
        const existingByStudent = new Map(gradeResponse.data.map((grade) => [grade.studentId, grade]))
        setRows(
          enrollmentResponse.data.map((enrollment: Enrollment) => {
            const existing = existingByStudent.get(enrollment.studentId)
            return {
              studentId: enrollment.studentId,
              studentName: enrollment.studentName ?? enrollment.studentId,
              existingGradeId: existing?.id,
              marks: existing ? String(existing.marks) : '',
              maxMarks: existing ? String(existing.maxMarks) : '100',
              grade: existing?.grade ?? '',
              remarks: existing?.remarks ?? '',
            }
          }),
        )
      })
      .catch(() => setRows([]))
      .finally(() => setLoadingRows(false))
  }, [courseId, assignmentId])

  function updateRow(studentId: string, patch: Partial<GradeDraftRow>) {
    setRows((current) => current.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)))
  }

  async function handleSave() {
    if (!courseId) return
    setSaving(true)
    try {
      await Promise.all(
        rows
          .filter((row) => row.marks !== '')
          .map((row) => {
            const payload = {
              studentId: row.studentId,
              courseId,
              assignmentId: assignmentId || undefined,
              marks: Number(row.marks),
              maxMarks: Number(row.maxMarks),
              grade: row.grade,
              remarks: row.remarks,
            }
            return row.existingGradeId ? updateGrade(row.existingGradeId, payload) : createGrade(payload)
          }),
      )
      toast.success('Grades saved successfully.')
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Assignment</label>
          <Select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} className="min-w-[220px]" disabled={!courseId}>
            <option value="">General / No assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={handleSave} loading={saving} disabled={!courseId || rows.length === 0}>
          Save Grades
        </Button>
      </div>

      {!courseId && <p className="text-sm text-muted">Select a course to enter grades.</p>}
      {courseId && loadingRows && <p className="text-sm text-muted">Loading students...</p>}
      {courseId && !loadingRows && rows.length === 0 && <p className="text-sm text-muted">No active enrollments found.</p>}

      {courseId && !loadingRows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Marks</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Max Marks</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Grade</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.studentId}>
                  <td className="px-4 py-3">{row.studentName}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={row.marks}
                      onChange={(event) => updateRow(row.studentId, { marks: event.target.value })}
                      className="max-w-[100px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={row.maxMarks}
                      onChange={(event) => updateRow(row.studentId, { maxMarks: event.target.value })}
                      className="max-w-[100px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.grade}
                      onChange={(event) => updateRow(row.studentId, { grade: event.target.value })}
                      className="max-w-[80px]"
                      placeholder="A"
                    />
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

function GradesReadOnlyView({ scopeToOwnRecords }: { scopeToOwnRecords: boolean }) {
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const [courseId, setCourseId] = useState('')
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  // MOCK: assumes the authenticated user's id matches the backend's
  // studentId filter for GET /api/v1/grades?studentId= — verify this
  // mapping against the real backend.
  const { items, loading, error, reload } = useListQuery(getGrades, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    courseId: courseId || undefined,
    studentId: scopeToOwnRecords ? user?.id : undefined,
  })

  useEffect(() => {
    setPage(0)
  }, [courseId])

  const averageMarks =
    items.length > 0 ? Math.round(items.reduce((sum, grade) => sum + (grade.marks / grade.maxMarks) * 100, 0) / items.length) : 0

  const columns: DataTableColumn<Grade>[] = [
    ...(scopeToOwnRecords ? [] : [{ header: 'Student', render: (grade: Grade) => grade.studentName ?? '-' }]),
    { header: 'Course', render: (grade) => grade.courseName ?? '-' },
    { header: 'Assignment', render: (grade) => grade.assignmentTitle ?? 'General' },
    { header: 'Marks', render: (grade) => `${grade.marks}/${grade.maxMarks}` },
    { header: 'Grade', render: (grade) => grade.grade },
    { header: 'Remarks', render: (grade) => grade.remarks || '-' },
  ]

  return (
    <div>
      {scopeToOwnRecords && (
        <div className="mb-4 rounded-card border border-border bg-card p-4 shadow-card">
          <p className="text-sm text-muted">Average Marks</p>
          <p className="text-2xl font-semibold text-gray-900">{averageMarks}%</p>
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
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(grade) => grade.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No grades found."
      />
    </div>
  )
}

export default function GradesPage() {
  const { role } = useAuth()

  return (
    <div>
      <PageHeader
        title="Grades"
        description={
          role === 'TEACHER'
            ? 'Enter and manage grades for your courses.'
            : role === 'STUDENT'
              ? 'View your grades.'
              : 'Review grades across the institution.'
        }
      />

      {role === 'TEACHER' && <TeacherGradeEntry />}
      {role === 'STUDENT' && <GradesReadOnlyView scopeToOwnRecords />}
      {role === 'ADMIN' && <GradesReadOnlyView scopeToOwnRecords={false} />}
    </div>
  )
}
