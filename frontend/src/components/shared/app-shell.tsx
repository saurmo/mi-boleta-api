import { BarChart3, ShieldCheck, Ticket, Trophy } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Dashboard', href: '/', icon: BarChart3 },
  { label: 'Boletas', href: '/tickets', icon: Ticket },
  { label: 'Admin', href: '/admin', icon: ShieldCheck },
] as const

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border/70 bg-card/70 p-6 backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Trophy className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Practica frontend</p>
            <h1 className="text-xl font-semibold tracking-tight">Mi Boleta</h1>
          </div>
        </div>

        <Separator className="my-6" />

        <nav className="grid gap-2">
          {navigation.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
