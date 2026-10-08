import { makeCrudApi } from './crudFactory'
import type { User } from '../types'

// Inferred: GET/POST /api/v1/users, GET/PUT/DELETE /api/v1/users/{id},
// PATCH /api/v1/users/{id}/status. Admin-only module — verify role
// enforcement and field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<User>('/api/v1/users')

export const getUsers = crud.list
export const getUser = crud.getById
export const createUser = crud.create
export const updateUser = crud.update
export const deleteUser = crud.remove

export async function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<User> {
  return crud.patch(id, { status }, 'status')
}
