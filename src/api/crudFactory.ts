import apiClient from './client'
import type { ApiResponse, ListResponse, QueryParams } from '../types'

// Shared factory for the GET-list / GET-one / POST / PUT / DELETE pattern
// repeated across every entity in the inferred backend contract. Individual
// api modules (studentApi.ts, courseApi.ts, ...) call this once per entity
// instead of re-writing the same axios calls, then add any entity-specific
// endpoints (e.g. PATCH status) alongside it.
export function makeCrudApi<TEntity, TRequest = Partial<TEntity>>(basePath: string) {
  async function list(params: QueryParams = {}): Promise<ListResponse<TEntity>> {
    const response = await apiClient.get(basePath, { params })
    const body = response.data
    // Normalize either { data, page, limit, total } or a bare array envelope.
    if (Array.isArray(body)) {
      return { data: body, page: 0, limit: body.length, total: body.length }
    }
    return {
      data: body.data ?? [],
      page: body.page ?? 0,
      limit: body.limit ?? (params.limit as number) ?? 10,
      total: body.total ?? body.data?.length ?? 0,
      message: body.message,
    }
  }

  async function getById(id: string): Promise<TEntity> {
    const response = await apiClient.get(`${basePath}/${id}`)
    const body: ApiResponse<TEntity> | TEntity = response.data
    return (body as ApiResponse<TEntity>).data ?? (body as TEntity)
  }

  async function create(input: TRequest): Promise<TEntity> {
    const response = await apiClient.post(basePath, input)
    const body: ApiResponse<TEntity> | TEntity = response.data
    return (body as ApiResponse<TEntity>).data ?? (body as TEntity)
  }

  async function update(id: string, input: TRequest): Promise<TEntity> {
    const response = await apiClient.put(`${basePath}/${id}`, input)
    const body: ApiResponse<TEntity> | TEntity = response.data
    return (body as ApiResponse<TEntity>).data ?? (body as TEntity)
  }

  async function remove(id: string): Promise<void> {
    await apiClient.delete(`${basePath}/${id}`)
  }

  async function patch<TPatch>(id: string, input: TPatch, suffix: string): Promise<TEntity> {
    const response = await apiClient.patch(`${basePath}/${id}/${suffix}`, input)
    const body: ApiResponse<TEntity> | TEntity = response.data
    return (body as ApiResponse<TEntity>).data ?? (body as TEntity)
  }

  return { list, getById, create, update, remove, patch }
}
