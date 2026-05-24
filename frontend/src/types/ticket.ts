import type { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants'

export type GameType = (typeof GAME_TYPES)[number]

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export type Ticket = {
  id: string
  userId: string
  title: string
  gameType: GameType
  gameNumber: string | null
  gameDate: string
  amount: number | null
  place: string | null
  status: TicketStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type TicketOwner = {
  id: string
  name: string
  email: string
}

export type TicketWithOwner = Ticket & {
  owner: TicketOwner
}

export type TicketFilters = {
  status?: TicketStatus
  gameType?: GameType
  q?: string
  page?: number
  pageSize?: number
}

export type AdminTicketFilters = TicketFilters & {
  userId?: string
}

export type CreateTicketPayload = {
  title: string
  gameType: GameType
  gameNumber?: string
  gameDate: string
  amount?: number
  place?: string
  status: TicketStatus
  notes?: string
}

export type UpdateTicketPayload = Partial<CreateTicketPayload>
