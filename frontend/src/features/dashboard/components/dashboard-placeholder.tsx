import { motion } from 'framer-motion'
import { CalendarClock, CircleDollarSign, ListChecks, Ticket } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTickets } from '@/hooks/use-tickets'

const statIcons = [Ticket, ListChecks, CalendarClock, CircleDollarSign] as const

const formatCurrency = (amount: number) =>
  amount.toLocaleString('es-CO', {
    currency: 'COP',
    maximumFractionDigits: 0,
    style: 'currency',
  })

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

export function DashboardPlaceholder() {
  const { data, isLoading } = useTickets()
  const tickets = data?.data ?? []
  const upcomingTickets = tickets.filter((ticket) => new Date(ticket.gameDate) > new Date('2026-05-21'))
  const recentTickets = [...tickets]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 5)
  const stats = [
    {
      label: 'Total registrados',
      value: tickets.length,
      description: 'Juegos guardados en el historial',
    },
    {
      label: 'Pendientes',
      value: tickets.filter((ticket) => ticket.status === 'Pendiente').length,
      description: 'Aún esperando resultado',
    },
    {
      label: 'Próximos',
      value: upcomingTickets.length,
      description: 'Boletas con fecha futura',
    },
    {
      label: 'Invertido',
      value: formatCurrency(tickets.reduce((total, ticket) => total + (ticket.amount ?? 0), 0)),
      description: 'Suma de montos conocidos',
    },
  ] as const

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          Conexión API real
        </Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Resumen de tus boletas y actividad reciente.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index]

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-9 w-24" /> : <p className="text-3xl font-semibold">{stat.value}</p>}
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card>
          <CardHeader>
            <CardTitle>Próximos sorteos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-20 w-full" key={index} />)
              : upcomingTickets.map((ticket) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={ticket.id}
                  >
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.gameType} · {ticket.gameNumber ?? 'Sin número'}
                      </p>
                    </div>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton className="h-12 w-full" key={index} />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>{ticket.gameType}</TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ticket.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}
