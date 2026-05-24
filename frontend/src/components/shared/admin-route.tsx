import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'

export function AdminRoute() {
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos')
    }
  }, [isAdmin])

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
