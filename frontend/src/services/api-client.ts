import { API_BASE_URL, AUTH_STORAGE_KEYS } from '@/lib/constants'
import { ApiError, type ApiErrorResponse } from '@/types/api'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  token?: string | null
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorResponse).error === 'string'
  )
}

const readStoredToken = () => {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem(AUTH_STORAGE_KEYS.token)
}

export const clearStoredSession = () => {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
}

export async function apiRequest<TResponse>(
  path: string,
  { body, headers, token = readStoredToken(), ...init }: RequestOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    clearStoredSession()
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = isApiErrorResponse(payload)
      ? payload.error
      : 'No fue posible completar la solicitud.'

    throw new ApiError(message, response.status)
  }

  return payload as TResponse
}
