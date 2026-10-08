import apiClient from './client'
import type { ListResponse, Notification, QueryParams } from '../types'

// Inferred: GET /api/v1/notifications -> ListResponse<NotificationResponse>.
export async function getNotifications(params: QueryParams = {}): Promise<ListResponse<Notification>> {
  const response = await apiClient.get('/api/v1/notifications', { params })
  const body = response.data
  return {
    data: body.data ?? [],
    page: body.page ?? 0,
    limit: body.limit ?? 10,
    total: body.total ?? body.data?.length ?? 0,
  }
}

// Inferred: PATCH /api/v1/notifications/{id}/read -> ApiResponse<NotificationResponse>.
export async function markNotificationRead(id: string): Promise<Notification> {
  const response = await apiClient.patch(`/api/v1/notifications/${id}/read`)
  return response.data?.data ?? response.data
}

// Inferred: PATCH /api/v1/notifications/read-all -> ApiResponse<MarkAllReadResponse>.
export async function markAllNotificationsRead(): Promise<number> {
  const response = await apiClient.patch('/api/v1/notifications/read-all')
  return response.data?.data?.updatedCount ?? 0
}

// Inferred: DELETE /api/v1/notifications/{id} -> ApiResponse<Void>.
export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/notifications/${id}`)
}
