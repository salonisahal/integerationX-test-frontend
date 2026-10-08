import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getUsers, deleteUser, updateUserStatus } from '../../api/userApi'
import type { User } from '../../types'
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

export default function UserList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { items, total, loading, error, reload } = useListQuery(getUsers, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    status: status || undefined,
  })

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, roleFilter, status])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleStatus(user: User) {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await updateUserStatus(user.id, nextStatus)
    reload()
  }

  const columns: DataTableColumn<User>[] = [
    { header: 'Name', render: (user) => formatFullName(user.firstName, user.lastName) },
    { header: 'Email', render: (user) => user.email },
    { header: 'Role', render: (user) => <Badge tone="info">{user.role}</Badge> },
    { header: 'Status', render: (user) => <Badge tone={statusToTone(user.status)}>{user.status}</Badge> },
    { header: 'Created Date', render: (user) => formatDate(user.createdAt) },
    {
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.USER_EDIT(user.id))}
            className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            className="rounded-input border border-border px-2 py-1 text-xs text-gray-600 hover:bg-surface"
          >
            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setDeleteTarget(user)}
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
        title="Users"
        description="Manage platform user accounts and roles."
        actions={
          <Button onClick={() => navigate(ROUTES.USER_NEW)}>
            <Plus size={16} />
            Add User
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email" />
        <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="max-w-[150px]">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
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
        rowKey={(user) => user.id}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No users found."
        emptyAction={
          <Button onClick={() => navigate(ROUTES.USER_NEW)}>
            <Plus size={16} />
            Add User
          </Button>
        }
      />

      <Pagination page={page} limit={DEFAULT_PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget ? formatFullName(deleteTarget.firstName, deleteTarget.lastName) : 'this user'}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
