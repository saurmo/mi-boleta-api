import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiRequest } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { CreateTicketPayload, Ticket, TicketFilters, UpdateTicketPayload } from '@/types/ticket'

function buildQueryString(filters?: TicketFilters): string {
  const params = new URLSearchParams()

  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.pageSize) params.set('pageSize', String(filters.pageSize))
  if (filters?.status) params.set('status', filters.status)
  if (filters?.gameType) params.set('gameType', filters.gameType)
  if (filters?.q) params.set('q', filters.q)

  const query = params.toString()

  return query ? `?${query}` : ''
}

export function useTickets(filters?: TicketFilters) {
  return useQuery<PaginatedResponse<Ticket>>({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const response = await apiRequest<PaginatedResponse<Ticket>>(`/tickets${buildQueryString(filters)}`)

      return response
    },
  })
}

export function useTicket(id: string) {
  return useQuery<Ticket | undefined>({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<Ticket>>(`/tickets/${id}`)

      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation<Ticket, Error, CreateTicketPayload>({
    mutationFn: async (payload) => {
      const response = await apiRequest<ApiResponse<Ticket>>('/tickets', {
        method: 'POST',
        body: payload,
      })

      return response.data
    },
    onSuccess: () => {
      toast.success('Boleta creada exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation<Ticket, Error, { id: string; payload: UpdateTicketPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await apiRequest<ApiResponse<Ticket>>(`/tickets/${id}`, {
        method: 'PUT',
        body: payload,
      })

      return response.data
    },
    onSuccess: () => {
      toast.success('Boleta actualizada exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiRequest(`/tickets/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      toast.success('Boleta eliminada exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
