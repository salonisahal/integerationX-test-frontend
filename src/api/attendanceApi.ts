import apiClient from './client'
import { makeCrudApi } from './crudFactory'
import type { Attendance, ListResponse, QueryParams } from '../types'

// Inferred: GET/POST /api/v1/attendance, GET/PUT /api/v1/attendance/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Attendance>('/api/v1/attendance')

export const getAttendanceRecords = crud.list
export const getAttendanceRecord = crud.getById
export const createAttendanceRecord = crud.create
export const updateAttendanceRecord = crud.update

// Inferred: GET /api/v1/students/{studentId}/attendance -> ListResponse<AttendanceResponse>.
export async function getStudentAttendance(
  studentId: string,
  params: QueryParams = {},
): Promise<ListResponse<Attendance>> {
  const response = await apiClient.get(`/api/v1/students/${studentId}/attendance`, { params })
  const body = response.data
  return {
    data: body.data ?? [],
    page: body.page ?? 0,
    limit: body.limit ?? 10,
    total: body.total ?? body.data?.length ?? 0,
  }
}

// Inferred: GET /api/v1/courses/{courseId}/attendance -> ListResponse<AttendanceResponse>.
export async function getCourseAttendance(
  courseId: string,
  params: QueryParams = {},
): Promise<ListResponse<Attendance>> {
  const response = await apiClient.get(`/api/v1/courses/${courseId}/attendance`, { params })
  const body = response.data
  return {
    data: body.data ?? [],
    page: body.page ?? 0,
    limit: body.limit ?? 10,
    total: body.total ?? body.data?.length ?? 0,
  }
}
