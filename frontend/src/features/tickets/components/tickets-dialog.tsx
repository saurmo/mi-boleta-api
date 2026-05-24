import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants'
import { useCreateTicket, useUpdateTicket } from '@/hooks/use-tickets'
import type { CreateTicketPayload, Ticket } from '@/types/ticket'

const ticketFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  gameType: z.enum(GAME_TYPES),
  gameNumber: z.string(),
  gameDate: z.string().min(1, 'La fecha es obligatoria'),
  amount: z
    .string()
    .refine((value) => value === '' || Number(value) >= 0, 'El monto no puede ser negativo'),
  place: z.string(),
  status: z.enum(TICKET_STATUSES),
  notes: z.string(),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

type TicketsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket?: Ticket
}

const formatDateInput = (date?: string) => (date ? date.slice(0, 10) : '')

export function TicketsDialog({ open, onOpenChange, ticket }: TicketsDialogProps) {
  const createTicket = useCreateTicket()
  const updateTicket = useUpdateTicket()
  const isEditing = Boolean(ticket)
  const isSubmitting = createTicket.isPending || updateTicket.isPending
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: '',
      gameType: 'Lotería',
      gameNumber: '',
      gameDate: '',
      amount: '',
      place: '',
      status: 'Pendiente',
      notes: '',
    },
  })

  useEffect(() => {
    form.reset({
      title: ticket?.title ?? '',
      gameType: ticket?.gameType ?? 'Lotería',
      gameNumber: ticket?.gameNumber ?? '',
      gameDate: formatDateInput(ticket?.gameDate),
      amount: ticket?.amount?.toString() ?? '',
      place: ticket?.place ?? '',
      status: ticket?.status ?? 'Pendiente',
      notes: ticket?.notes ?? '',
    })
  }, [form, ticket])

  const onSubmit = async (values: TicketFormValues) => {
    const amount = values.amount.trim() ? Number(values.amount) : undefined
    const payload: CreateTicketPayload = {
      title: values.title,
      gameType: values.gameType,
      gameNumber: values.gameNumber.trim() || undefined,
      gameDate: new Date(`${values.gameDate}T00:00:00.000`).toISOString(),
      amount,
      place: values.place.trim() || undefined,
      status: values.status,
      notes: values.notes.trim() || undefined,
    }

    if (ticket) {
      await updateTicket.mutateAsync({ id: ticket.id, payload })
    } else {
      await createTicket.mutateAsync(payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar boleta' : 'Nueva boleta'}</DialogTitle>
          <DialogDescription>
            Ingresa la información completa de la boleta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Lotería de Medellín" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gameType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de juego</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GAME_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TICKET_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gameNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gameDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        min="0"
                        placeholder="5000"
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar</FormLabel>
                    <FormControl>
                      <Input placeholder="Tienda La Esquina" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalles importantes..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
