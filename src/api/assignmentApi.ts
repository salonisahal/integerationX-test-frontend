import { makeCrudApi } from './crudFactory'
import type { Assignment } from '../types'

// Inferred: GET/POST /api/v1/assignments, GET/PUT/DELETE /api/v1/assignments/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Assignment>('/api/v1/assignments')

export const getAssignments = crud.list
export const getAssignment = crud.getById
export const createAssignment = crud.create
export const updateAssignment = crud.update
export const deleteAssignment = crud.remove
