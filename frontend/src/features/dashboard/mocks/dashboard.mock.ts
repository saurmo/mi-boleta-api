import { mockTickets } from '@/features/tickets/mocks/tickets.mock'

export const mockDashboardStats = [
  {
    label: 'Total registrados',
    value: mockTickets.length,
    description: 'Juegos guardados en el historial',
  },
  {
    label: 'Pendientes',
    value: mockTickets.filter((ticket) => ticket.status === 'Pendiente').length,
    description: 'Aun esperando resultado',
  },
  {
    label: 'Proximos',
    value: mockTickets.filter((ticket) => new Date(ticket.gameDate) > new Date('2026-05-21')).length,
    description: 'Fechas futuras en mock data',
  },
  {
    label: 'Invertido',
    value: `$${mockTickets.reduce((total, ticket) => total + (ticket.amount ?? 0), 0).toLocaleString('es-CO')}`,
    description: 'Suma de montos conocidos',
  },
] as const

export const mockUpcomingTickets = mockTickets.filter(
  (ticket) => new Date(ticket.gameDate) > new Date('2026-05-21'),
)
