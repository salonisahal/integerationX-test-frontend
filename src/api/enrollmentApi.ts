import { makeCrudApi } from './crudFactory'
import type { Enrollment } from '../types'

// Inferred: GET/POST /api/v1/enrollments, GET/PUT/DELETE /api/v1/enrollments/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Enrollment>('/api/v1/enrollments')

export const getEnrollments = crud.list
export const getEnrollment = crud.getById
export const createEnrollment = crud.create
export const updateEnrollment = crud.update
export const deleteEnrollment = crud.remove
