import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { TicketCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.email('Ingresa un email valido'),
  password: z.string().min(6, 'La contraseña debe tener minimo 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'juan@example.com',
      password: 'secret123',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    console.log('Mock login', values)
    await login(values)
    toast.success('Inicio de sesión exitoso')
    setIsSubmitting(false)
    navigate('/')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/70 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <TicketCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription>Entra con tu cuenta para gestionar tus boletas.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="juan@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input placeholder="secret123" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/register">
                Crear cuenta
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
