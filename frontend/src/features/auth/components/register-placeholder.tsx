import { Navigate } from 'react-router-dom'

import { RegisterForm } from '@/features/auth/components/register-form'
import { useAuth } from '@/hooks/use-auth'

export function RegisterPlaceholder() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <RegisterForm />
}
