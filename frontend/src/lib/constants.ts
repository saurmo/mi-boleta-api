export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://mi-boleta-api-y9dv.onrender.com/api/v1'

export const GAME_TYPES = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'] as const

export const TICKET_STATUSES = ['Pendiente', 'Ganado', 'Perdido'] as const

export const AUTH_STORAGE_KEYS = {
  token: 'mi-boleta-token',
  user: 'mi-boleta-user',
} as const
