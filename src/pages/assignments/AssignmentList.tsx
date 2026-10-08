import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getAssignments, deleteAssignment, updateAssignment } from '../../api/assignmentApi'
import { getCourses } from '../../api/courseApi'
import type { Assignment, AssignmentStatus, Course } from '../../types'
import { useListQuery } from '../../hooks/useListQuery'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/tables/SearchBar'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Pagination from '../../components/tables/Pagination'
import Badge, { statusToTone } from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { formatDate, isOverdue } from '../../utils/formatters'
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'

export default function AssignmentList() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const canManage = role === 'TEACHER' || role === 'ADMIN'

  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getAssignments, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    courseId: courseId || undefined,
    status: status || (role === 'STUDENT' ? 'PUBLISHED' : undefined),
  })

  useEffect(() => {
    getCourses({ page: 0, limit: 100 }).then((response) => setCourses(response.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, courseId, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAssignment(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(assignment: Assignment, nextStatus: AssignmentStatus) {
    await updateAssignment(assignment.id, { ...assignment, status: nextStatus })
    reload()
  }

  const columns: DataTableColumn<Assignment>[] = [
    { header: 'Title', render: (assignment) => assignment.title },
    { header: 'Course', render: (assignment) => assignment.courseName ?? '-' },
    {
      header: 'Due Date',
      render: (assignment) => (
        <span className={isOverdue(assignment.dueDate) && assignment.status !== 'CLOSED' ? 'font-medium text-danger' : ''}>
          {formatDate(assignment.dueDate)}
          {isOverdue(assignment.dueDate) && assignment.status !== 'CLOSED' ? ' (Overdue)' : ''}
        </span>
      ),
    },
    { header: 'Max Marks', render: (assignment) => assignment.maxMarks },
    { header: 'Status', render: (assignment) => <Badge tone={statusToTone(assignment.status)}>{assignment.status}</Badge> },
    {
      header: 'Actions',
      render: (assignment) =>
        canManage ? (
          <div className="flex items-center gap-2">
            {assignment.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange(assignment, 'PUBLISHED')}
                className="rounded-input border border-border px-2 py-1 text-xs text-gray-600 hover:bg-surface"
              >
                Publish
              </button>
            )}
            {assignment.status === 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange(assignment, 'CLOSED')}
                className="rounded-input border border-border px-2 py-1 text-xs text-gray-600 hover:bg-surface"
              >
                Close
              </button>
            )}
            <button
              onClick={() => navigate(ROUTES.ASSIGNMENT_EDIT(assignment.id))}
              className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteTarget(assignment)}
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
        title="Assignments"
        description="Track and manage course assignments."
        actions={
          canManage && (
            <Button onClick={() => navigate(ROUTES.ASSIGNMENT_NEW)}>
              <Plus size={16} />
              Add Assignment
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assignments" />
        <Select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="max-w-[200px]">
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseCode} — {course.courseName}
            </option>
          ))}
        </Select>
        {role !== 'STUDENT' && (
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-[150px]">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </Select>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(assignment) => assignment.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No assignments found."
        emptyAction={
          canManage && (
            <Button onClick={() => navigate(ROUTES.ASSIGNMENT_NEW)}>
              <Plus size={16} />
              Add Assignment
            </Button>
          )
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete assignment"
        message={`Are you sure you want to delete ${deleteTarget?.title ?? 'this assignment'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
