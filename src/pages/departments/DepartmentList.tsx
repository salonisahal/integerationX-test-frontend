import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getDepartments, deleteDepartment } from '../../api/departmentApi'
import type { Department } from '../../types'
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
import { ROUTES, DEFAULT_PAGE_SIZE } from '../../constants/routes'

export default function DepartmentList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getDepartments, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
  })

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteDepartment(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  const columns: DataTableColumn<Department>[] = [
    { header: 'Name', render: (department) => department.name },
    { header: 'Code', render: (department) => department.code },
    { header: 'Description', render: (department) => department.description },
    { header: 'Department Head', render: (department) => department.departmentHeadName ?? '-' },
    { header: 'Status', render: (department) => <Badge tone={statusToTone(department.status)}>{department.status}</Badge> },
    {
      header: 'Actions',
      render: (department) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.DEPARTMENT_EDIT(department.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(department)}
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
        title="Departments"
        description="Manage academic departments."
        actions={
          <Button onClick={() => navigate(ROUTES.DEPARTMENT_NEW)}>
            <Plus size={16} />
            Add Department
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search departments" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-[150px]">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(department) => department.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No departments found."
        emptyAction={
          <Button onClick={() => navigate(ROUTES.DEPARTMENT_NEW)}>
            <Plus size={16} />
            Add Department
          </Button>
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete department"
        message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this department'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
