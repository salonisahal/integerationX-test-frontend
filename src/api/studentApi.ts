import { makeCrudApi } from './crudFactory'
import type { Student } from '../types'

// Inferred from backend contract:
// GET/POST /api/v1/students, GET/PUT/DELETE /api/v1/students/{id},
// PATCH /api/v1/students/{id}/status. Verify exact field names against the
// real backend's OpenAPI schema before relying on this in production.
const crud = makeCrudApi<Student>('/api/v1/students')

export const getStudents = crud.list
export const getStudent = crud.getById
export const createStudent = crud.create
export const updateStudent = crud.update
export const deleteStudent = crud.remove

export async function updateStudentStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Student> {
  return crud.patch(id, { status }, 'status')
}
