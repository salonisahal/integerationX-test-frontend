import { makeCrudApi } from './crudFactory'
import type { Department } from '../types'

// Inferred: GET/POST /api/v1/departments, GET/PUT/DELETE /api/v1/departments/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Department>('/api/v1/departments')

export const getDepartments = crud.list
export const getDepartment = crud.getById
export const createDepartment = crud.create
export const updateDepartment = crud.update
export const deleteDepartment = crud.remove
