import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, Eye } from 'lucide-react'
import { getTeachers, deleteTeacher } from '../../api/teacherApi'
import { getDepartments } from '../../api/departmentApi'
import type { Department, Teacher } from '../../types'
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

export default function TeacherList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getTeachers, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    status: status || undefined,
    sortBy: 'firstName',
    sortDir: 'asc',
  })

  useEffect(() => {
    getDepartments({ page: 0, limit: 100 })
      .then((response) => setDepartments(response.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, departmentId, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTeacher(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  const columns: DataTableColumn<Teacher>[] = [
    { header: 'Employee ID', render: (teacher) => teacher.employeeId },
    { header: 'Name', render: (teacher) => formatFullName(teacher.firstName, teacher.lastName) },
    { header: 'Email', render: (teacher) => teacher.email },
    { header: 'Phone', render: (teacher) => teacher.phone },
    { header: 'Department', render: (teacher) => teacher.departmentName ?? '-' },
    { header: 'Specialization', render: (teacher) => teacher.specialization },
    { header: 'Joining Date', render: (teacher) => formatDate(teacher.joiningDate) },
    { header: 'Status', render: (teacher) => <Badge tone={statusToTone(teacher.status)}>{teacher.status}</Badge> },
    {
      header: 'Actions',
      render: (teacher) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => navigate(ROUTES.TEACHER_DETAIL(teacher.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(ROUTES.TEACHER_EDIT(teacher.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(teacher)}
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
        title="Teachers"
        description="Manage teaching staff."
        actions={
          <Button onClick={() => navigate(ROUTES.TEACHER_NEW)}>
            <Plus size={16} />
            Add Teacher
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email" />
        <Select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="max-w-[180px]">
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
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
        rowKey={(teacher) => teacher.id}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(teacher) => navigate(ROUTES.TEACHER_DETAIL(teacher.id))}
        emptyTitle="No teachers found."
        emptyAction={
          <Button onClick={() => navigate(ROUTES.TEACHER_NEW)}>
            <Plus size={16} />
            Add Teacher
          </Button>
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete teacher"
        message={`Are you sure you want to delete ${deleteTarget ? formatFullName(deleteTarget.firstName, deleteTarget.lastName) : 'this teacher'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
