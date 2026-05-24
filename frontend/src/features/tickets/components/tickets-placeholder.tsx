import { motion } from 'framer-motion'
import { Edit, Plus, SearchX, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TicketsFilters } from '@/features/tickets/components/tickets-filters'
import { useDeleteTicket, useTickets } from '@/hooks/use-tickets'
import type { Ticket, TicketFilters } from '@/types/ticket'

export function TicketsPlaceholder() {
  const [filters, setFilters] = useState<TicketFilters>({ page: 1 })
  const [filterResetKey, setFilterResetKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
  const { data, isLoading } = useTickets(filters)
  const deleteTicket = useDeleteTicket()

  const tickets = data?.data ?? []
  const meta = data?.meta

  const openCreateDialog = () => {
    setSelectedTicket(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  const handleDelete = (ticket: Ticket) => {
    if (window.confirm(`¿Eliminar la boleta "${ticket.title}"? Esta acción no se puede deshacer.`)) {
      deleteTicket.mutate(ticket.id)
    }
  }

  const clearFilters = useCallback(() => {
    setFilters({ page: 1 })
    setFilterResetKey((key) => key + 1)
  }, [])

  const updateFilters = useCallback((newFilters: TicketFilters) => {
    setFilters((currentFilters) => {
      const nextFilters = { ...newFilters, page: 1 }

      if (
        currentFilters.q === nextFilters.q &&
        currentFilters.status === nextFilters.status &&
        currentFilters.gameType === nextFilters.gameType &&
        currentFilters.page === nextFilters.page
      ) {
        return currentFilters
      }

      return nextFilters
    })
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Mis boletas</h2>
          <p className="text-muted-foreground">Gestiona tus boletas y sigue tus resultados.</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nueva boleta
        </Button>
      </div>

      <TicketsFilters key={filterResetKey} onFiltersChange={updateFilters} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>
              {meta ? `Boletas (${meta.total})` : 'Boletas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.gameType}</TableCell>
                        <TableCell>{ticket.gameNumber ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ticket.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => openEditDialog(ticket)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(ticket)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {meta && meta.totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          aria-disabled={meta.page === 1}
                          className={meta.page === 1 ? 'pointer-events-none opacity-50' : undefined}
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            goToPage(meta.page - 1)
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
                              isActive={pageNumber === meta.page}
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
                          aria-disabled={meta.page === meta.totalPages}
                          className={meta.page === meta.totalPages ? 'pointer-events-none opacity-50' : undefined}
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            goToPage(meta.page + 1)
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
                  <p className="font-medium">No se encontraron boletas</p>
                  <p className="text-sm text-muted-foreground">Prueba con otros filtros o vuelve al listado completo.</p>
                </div>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <TicketsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} ticket={selectedTicket} />
    </section>
  )
}
