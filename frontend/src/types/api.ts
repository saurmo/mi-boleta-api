export type ApiResponse<TData> = {
  data: TData
}

export type ApiErrorResponse = {
  error: string
}

export type PaginationMeta = {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedResponse<TData> = {
  data: TData[]
  meta: PaginationMeta
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
