import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getEnrollments, deleteEnrollment } from '../../api/enrollmentApi'
import { getCourses } from '../../api/courseApi'
import type { Course, Enrollment } from '../../types'
import { useListQuery } from '../../hooks/useListQuery'
import PageHeader from '../../components/common/PageHeader'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Pagination from '../../components/tables/Pagination'
import Badge, { statusToTone } from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { formatDate } from '../../utils/formatters'
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'

export default function EnrollmentList() {
  const navigate = useNavigate()
  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { items, total, loading, error, reload } = useListQuery(getEnrollments, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    courseId: courseId || undefined,
    status: status || undefined,
  })

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [courseId, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEnrollment(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  const columns: DataTableColumn<Enrollment>[] = [
    { header: 'Student', render: (enrollment) => enrollment.studentName ?? '-' },
    { header: 'Course', render: (enrollment) => enrollment.courseName ?? '-' },
    { header: 'Enrollment Date', render: (enrollment) => formatDate(enrollment.enrollmentDate) },
    { header: 'Semester', render: (enrollment) => enrollment.semester },
    { header: 'Status', render: (enrollment) => <Badge tone={statusToTone(enrollment.status)}>{enrollment.status}</Badge> },
    {
      header: 'Actions',
      render: (enrollment) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.ENROLLMENT_EDIT(enrollment.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(enrollment)}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Enrollments"
        description="Manage student course enrollments."
        actions={
          <Button onClick={() => navigate(ROUTES.ENROLLMENT_NEW)}>
            <Plus size={16} />
            Add Enrollment
          </Button>
        }
      />

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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(enrollment) => enrollment.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No enrollments found."
        emptyAction={
          <Button onClick={() => navigate(ROUTES.ENROLLMENT_NEW)}>
            <Plus size={16} />
            Add Enrollment
          </Button>
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete enrollment"
        message="Are you sure you want to delete this enrollment? This action cannot be undone."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
