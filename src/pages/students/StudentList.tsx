import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, Eye } from 'lucide-react'
import { getStudents, deleteStudent, updateStudentStatus } from '../../api/studentApi'
import { getDepartments } from '../../api/departmentApi'
import type { Department, Student } from '../../types'
import { useListQuery } from '../../hooks/useListQuery'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/tables/SearchBar'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import DataTable, { type DataTableColumn } from '../../components/tables/DataTable'
import Pagination from '../../components/tables/Pagination'
import Badge, { statusToTone } from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { formatDate, formatFullName } from '../../utils/formatters'
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentList() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [semester, setSemester] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getStudents, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    semester: semester || undefined,
    status: status || undefined,
    sortBy: 'firstName',
    sortDir: 'asc',
  })

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 })
      .then((response) => setDepartments(response.data))
      .catch(() => {
        // Department filter simply stays empty; the toast already surfaced
        // this failure via the shared interceptor.
      })
  }, [])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, departmentId, semester, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStudent(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleStatus(student: Student) {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await updateStudentStatus(student.id, nextStatus)
    reload()
  }

  const canManage = role === 'ADMIN'

  const columns: DataTableColumn<Student>[] = [
    { header: 'Student ID', render: (student) => student.studentId },
    { header: 'Name', render: (student) => formatFullName(student.firstName, student.lastName) },
    { header: 'Email', render: (student) => student.email },
    { header: 'Phone', render: (student) => student.phone },
    { header: 'Department', render: (student) => student.departmentName ?? '-' },
    { header: 'Semester', render: (student) => student.semester },
    {
      header: 'Status',
      render: (student) => <Badge tone={statusToTone(student.status)}>{student.status}</Badge>,
    },
    { header: 'Admission Date', render: (student) => formatDate(student.admissionDate) },
    {
      header: 'Actions',
      render: (student) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => navigate(ROUTES.STUDENT_DETAIL(student.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
            aria-label="View"
          >
            <Eye size={16} />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => navigate(ROUTES.STUDENT_EDIT(student.id))}
                className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleToggleStatus(student)}
                className="rounded-input border border-border px-2 py-1 text-xs text-gray-600 hover:bg-surface"
              >
                {student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => setDeleteTarget(student)}
                className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-danger"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records."
        actions={
          canManage && (
            <Button onClick={() => navigate(ROUTES.STUDENT_NEW)}>
              <Plus size={16} />
              Add Student
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, or email" />
        <Select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="max-w-[180px]">
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
        <Select value={semester} onChange={(event) => setSemester(event.target.value)} className="max-w-[150px]">
          <option value="">All Semesters</option>
          {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              Semester {value}
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
        rowKey={(student) => student.id}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(student) => navigate(ROUTES.STUDENT_DETAIL(student.id))}
        emptyTitle="No students found."
        emptyAction={
          canManage && (
            <Button onClick={() => navigate(ROUTES.STUDENT_NEW)}>
              <Plus size={16} />
              Add Student
            </Button>
          )
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete student"
        message={`Are you sure you want to delete ${deleteTarget ? formatFullName(deleteTarget.firstName, deleteTarget.lastName) : 'this student'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
