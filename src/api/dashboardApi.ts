import apiClient from './client'
import type { AdminDashboard, StudentDashboard, TeacherDashboard } from '../types'

// Inferred: GET /api/v1/dashboard/admin -> ApiResponse<AdminDashboardResponse>.
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await apiClient.get('/api/v1/dashboard/admin')
  return response.data?.data ?? response.data
}

// Inferred: GET /api/v1/dashboard/teacher -> ApiResponse<TeacherDashboardResponse>.
export async function getTeacherDashboard(): Promise<TeacherDashboard> {
  const response = await apiClient.get('/api/v1/dashboard/teacher')
  return response.data?.data ?? response.data
}

// Inferred: GET /api/v1/dashboard/student -> ApiResponse<StudentDashboardResponse>.
export async function getStudentDashboard(): Promise<StudentDashboard> {
  const response = await apiClient.get('/api/v1/dashboard/student')
  return response.data?.data ?? response.data
}
