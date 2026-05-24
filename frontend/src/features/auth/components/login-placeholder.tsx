import { Navigate } from 'react-router-dom'

import { LoginForm } from '@/features/auth/components/login-form'
import { useAuth } from '@/hooks/use-auth'

export function LoginPlaceholder() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <LoginForm />
}
