import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getClasses, deleteClass } from '../../api/classApi'
import { getCourses } from '../../api/courseApi'
import type { Course, SchoolClass } from '../../types'
import { useListQuery } from '../../hooks/useListQuery'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Pagination from '../../components/tables/Pagination'
import Badge, { statusToTone } from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'

export default function ClassList() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const canManage = role === 'ADMIN' || role === 'TEACHER'

  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { items, total, loading, error, reload } = useListQuery(getClasses, {
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
      await deleteClass(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  const columns: DataTableColumn<SchoolClass>[] = [
    { header: 'Class Name', render: (schoolClass) => schoolClass.className },
    { header: 'Course', render: (schoolClass) => schoolClass.courseName ?? '-' },
    { header: 'Teacher', render: (schoolClass) => schoolClass.teacherName ?? '-' },
    { header: 'Room', render: (schoolClass) => schoolClass.room },
    { header: 'Day', render: (schoolClass) => schoolClass.day },
    { header: 'Time', render: (schoolClass) => `${schoolClass.startTime} - ${schoolClass.endTime}` },
    { header: 'Semester', render: (schoolClass) => schoolClass.semester },
    { header: 'Status', render: (schoolClass) => <Badge tone={statusToTone(schoolClass.status)}>{schoolClass.status}</Badge> },
    {
      header: 'Actions',
      render: (schoolClass) =>
        canManage ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.CLASS_EDIT(schoolClass.id))}
              className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteTarget(schoolClass)}
              className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Scheduled class sessions."
        actions={
          canManage && (
            <Button onClick={() => navigate(ROUTES.CLASS_NEW)}>
              <Plus size={16} />
              Add Class
            </Button>
          )
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
        rowKey={(schoolClass) => schoolClass.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No classes found."
        emptyAction={
          canManage && (
            <Button onClick={() => navigate(ROUTES.CLASS_NEW)}>
              <Plus size={16} />
              Add Class
            </Button>
          )
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete class"
        message={`Are you sure you want to delete ${deleteTarget?.className ?? 'this class'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
