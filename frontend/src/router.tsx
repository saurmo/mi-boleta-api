import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AdminRoute } from '@/components/shared/admin-route'
import { AppShell } from '@/components/shared/app-shell'
import { PrivateRoute } from '@/components/shared/private-route'
import { AdminPlaceholder } from '@/features/admin/components/admin-placeholder'
import { LoginPlaceholder } from '@/features/auth/components/login-placeholder'
import { RegisterPlaceholder } from '@/features/auth/components/register-placeholder'
import { DashboardPlaceholder } from '@/features/dashboard/components/dashboard-placeholder'
import { TicketsPlaceholder } from '@/features/tickets/components/tickets-placeholder'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          { index: true, element: <DashboardPlaceholder /> },
          { path: 'tickets', element: <TicketsPlaceholder /> },
          {
            element: <AdminRoute />,
            children: [{ path: 'admin', element: <AdminPlaceholder /> }],
          },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPlaceholder /> },
  { path: '/register', element: <RegisterPlaceholder /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
