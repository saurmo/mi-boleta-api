import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants'
import type { GameType, TicketFilters, TicketStatus } from '@/types/ticket'

const ALL_VALUE = 'all'

type TicketsFiltersProps = {
  onFiltersChange: (filters: TicketFilters) => void
}

function isTicketStatus(value: string): value is TicketStatus {
  return TICKET_STATUSES.some((status) => status === value)
}

function isGameType(value: string): value is GameType {
  return GAME_TYPES.some((type) => type === value)
}

export function TicketsFilters({ onFiltersChange }: TicketsFiltersProps) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<TicketStatus | typeof ALL_VALUE>(ALL_VALUE)
  const [gameType, setGameType] = useState<GameType | typeof ALL_VALUE>(ALL_VALUE)

  useEffect(() => {
    onFiltersChange({
      q: q.trim() || undefined,
      status: status === ALL_VALUE ? undefined : status,
      gameType: gameType === ALL_VALUE ? undefined : gameType,
    })
  }, [gameType, onFiltersChange, q, status])

  const clearFilters = () => {
    setQ('')
    setStatus(ALL_VALUE)
    setGameType(ALL_VALUE)
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border/70 bg-card/70 p-4 backdrop-blur md:grid-cols-[1fr_auto_auto_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar boletas..."
          value={q}
        />
      </div>
      <Select
        onValueChange={(value) => {
          setStatus(isTicketStatus(value) ? value : ALL_VALUE)
        }}
        value={status}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos</SelectItem>
          {TICKET_STATUSES.map((ticketStatus) => (
            <SelectItem key={ticketStatus} value={ticketStatus}>
              {ticketStatus}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => {
          setGameType(isGameType(value) ? value : ALL_VALUE)
        }}
        value={gameType}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Tipo de juego" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos</SelectItem>
          {GAME_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button className="gap-2" onClick={clearFilters} type="button" variant="outline">
        <X className="size-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}
