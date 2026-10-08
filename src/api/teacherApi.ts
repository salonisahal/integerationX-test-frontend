import { makeCrudApi } from './crudFactory'
import type { Teacher } from '../types'

// Inferred: GET/POST /api/v1/teachers, GET/PUT/DELETE /api/v1/teachers/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Teacher>('/api/v1/teachers')

export const getTeachers = crud.list
export const getTeacher = crud.getById
export const createTeacher = crud.create
export const updateTeacher = crud.update
export const deleteTeacher = crud.remove
