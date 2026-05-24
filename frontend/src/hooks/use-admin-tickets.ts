import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminTicketFilters, TicketWithOwner } from '@/types/ticket'

function buildQueryString(filters?: AdminTicketFilters): string {
  const params = new URLSearchParams()

  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.pageSize) params.set('pageSize', String(filters.pageSize))
  if (filters?.status) params.set('status', filters.status)
  if (filters?.gameType) params.set('gameType', filters.gameType)
  if (filters?.q) params.set('q', filters.q)
  if (filters?.userId) params.set('userId', filters.userId)

  const query = params.toString()

  return query ? `?${query}` : ''
}

export function useAdminTickets(filters?: AdminTicketFilters) {
  return useQuery<PaginatedResponse<TicketWithOwner>>({
    queryKey: ['admin-tickets', filters],
    queryFn: async () => {
      const response = await apiRequest<PaginatedResponse<TicketWithOwner>>(
        `/admin/tickets${buildQueryString(filters)}`,
      )

      return response
    },
  })
}

export function useAdminTicket(id: string) {
  return useQuery<TicketWithOwner | undefined>({
    queryKey: ['admin-tickets', id],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<TicketWithOwner>>(`/admin/tickets/${id}`)

      return response.data
    },
    enabled: Boolean(id),
  })
}
