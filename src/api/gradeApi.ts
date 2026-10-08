import { makeCrudApi } from './crudFactory'
import type { Grade } from '../types'

// Inferred: GET/POST /api/v1/grades, GET/PUT/DELETE /api/v1/grades/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Grade>('/api/v1/grades')

export const getGrades = crud.list
export const getGrade = crud.getById
export const createGrade = crud.create
export const updateGrade = crud.update
export const deleteGrade = crud.remove
