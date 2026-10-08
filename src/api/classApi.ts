import { makeCrudApi } from './crudFactory'
import type { SchoolClass } from '../types'

// Inferred: GET/POST /api/v1/classes, GET/PUT/DELETE /api/v1/classes/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<SchoolClass>('/api/v1/classes')

export const getClasses = crud.list
export const getClassById = crud.getById
export const createClass = crud.create
export const updateClass = crud.update
export const deleteClass = crud.remove
