import { motion } from 'framer-motion'
import { Edit, Search, SearchX, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TicketsDialog } from '@/features/tickets/components/tickets-dialog'
import { useAdminTickets } from '@/hooks/use-admin-tickets'
import type { AdminTicketFilters, TicketWithOwner } from '@/types/ticket'

export function AdminPlaceholder() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketWithOwner | undefined>()
  const filters: AdminTicketFilters = useMemo(
    () => ({ q: q.trim() || undefined, page }),
    [q, page],
  )
  const { data, isLoading } = useAdminTickets(filters)

  const tickets = data?.data ?? []
  const meta = data?.meta

  const updateSearch = (value: string) => {
    setQ(value)
    setPage(1)
  }

  const goToPage = (nextPage: number) => {
    if (meta) {
      setPage(Math.min(meta.totalPages, Math.max(1, nextPage)))
    }
  }

  const openEditDialog = (ticket: TicketWithOwner) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Admin</h2>
          <p className="text-muted-foreground">
            Panel de administración — todos los tickets del sistema.
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{meta ? `Todos los tickets (${meta.total})` : 'Todos los tickets'}</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Buscar por ticket, dueño o email..."
                value={q}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton className="h-12 w-full" key={index} />
                ))}
              </div>
            ) : tickets.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Tipo de juego</TableHead>
                      <TableHead>Dueño</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.gameType}</TableCell>
                        <TableCell>{ticket.owner.name}</TableCell>
                        <TableCell>{ticket.owner.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            className="gap-2"
                            onClick={() => openEditDialog(ticket)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="size-4" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {meta && meta.totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          aria-disabled={page === 1}
                          className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            goToPage(page - 1)
                          }}
                          text="Anterior"
                        />
                      </PaginationItem>
                      {Array.from({ length: meta.totalPages }).map((_, index) => {
                        const pageNumber = index + 1

                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={pageNumber === page}
                              onClick={(event) => {
                                event.preventDefault()
                                goToPage(pageNumber)
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          aria-disabled={page === meta.totalPages}
                          className={page === meta.totalPages ? 'pointer-events-none opacity-50' : undefined}
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            goToPage(page + 1)
                          }}
                          text="Siguiente"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="grid place-items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
                <SearchX className="size-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">No hay resultados para la búsqueda</p>
                  <p className="text-sm text-muted-foreground">
                    La búsqueda revisa título, nombre del dueño y correo.
                  </p>
                </div>
                <Button onClick={() => updateSearch('')} variant="outline">
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <TicketsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ticket={selectedTicket}
      />
    </section>
  )
}
