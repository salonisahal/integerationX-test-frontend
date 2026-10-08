import { makeCrudApi } from './crudFactory'
import type { Course } from '../types'

// Inferred: GET/POST /api/v1/courses, GET/PUT/DELETE /api/v1/courses/{id}.
// Verify field names against the real backend's OpenAPI schema.
const crud = makeCrudApi<Course>('/api/v1/courses')

export const getCourses = crud.list
export const getCourse = crud.getById
export const createCourse = crud.create
export const updateCourse = crud.update
export const deleteCourse = crud.remove
