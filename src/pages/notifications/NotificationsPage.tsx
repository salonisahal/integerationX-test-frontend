import { useEffect, useState } from 'react'
import { CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notificationApi'
import { useListQuery } from '../../hooks/useListQuery'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import { SkeletonLine } from '../../components/common/Skeleton'
import Badge from '../../components/common/Badge'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { formatDateTime } from '../../utils/formatters'
import { DEFAULT_PAGE_SIZE } from '../../constants/routes'
import type { Notification } from '../../types'

const typeTone: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'danger',
}

export default function NotificationsPage() {
  const [page, setPage] = useState(0)
  const [isReadFilter, setIsReadFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const { items, total, loading, error, reload } = useListQuery(getNotifications, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    isRead: isReadFilter || undefined,
  })

  useEffect(() => {
    setPage(0)
  }, [isReadFilter])

  async function handleMarkRead(notification: Notification) {
    try {
      await markNotificationRead(notification.id)
      reload()
    } catch {
      // Toast already surfaced via the shared interceptor.
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      const updatedCount = await markAllNotificationsRead()
      toast.success(`Marked ${updatedCount} notification(s) as read.`)
      reload()
    } catch {
      // Toast already surfaced via the shared interceptor.
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteNotification(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay up to date with institution activity."
        actions={
          <Button variant="secondary" onClick={handleMarkAllRead} loading={markingAll}>
            <CheckCheck size={16} />
            Mark All as Read
          </Button>
        }
      />

      <div className="mb-4">
        <Select value={isReadFilter} onChange={(event) => setIsReadFilter(event.target.value)} className="max-w-[170px]">
          <option value="">All Notifications</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </Select>
      </div>

      <div className="rounded-card border border-border bg-card shadow-card">
        {loading && (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonLine key={index} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && items.length === 0 && <EmptyState title="No notifications found." />}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y divide-border">
            {items.map((notification) => (
              <li key={notification.id} className="flex items-start justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <Badge tone={typeTone[notification.type] ?? 'neutral'}>{notification.type}</Badge>
                    </div>
                    {notification.message && <p className="mt-1 text-sm text-muted">{notification.message}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(notification.createdAt)}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification)}
                      className="rounded-input border border-border px-2 py-1 text-xs text-gray-600 hover:bg-surface"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(notification)}
                    className="rounded p-1.5 text-gray-500 hover:bg-surface hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {total > DEFAULT_PAGE_SIZE && (
        <div className="mt-2 flex justify-center gap-2 text-sm text-muted">
          <button
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={page === 0}
            className="rounded-input border border-border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((value) => value + 1)}
            disabled={(page + 1) * DEFAULT_PAGE_SIZE >= total}
            className="rounded-input border border-border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
