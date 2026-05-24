import { useEffect, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AUTH_STORAGE_KEYS } from '@/lib/constants'
import { apiRequest, clearStoredSession } from '@/services/api-client'
import type { ApiResponse } from '@/types/api'
import type { AuthSession, LoginPayload, LoginResponse, PublicUser, RegisterPayload, UserRole } from '@/types/auth'

const listeners = new Set<() => void>()

let currentSession: AuthSession | null = readSession()

function isUserRole(value: unknown): value is UserRole {
  return value === 'user' || value === 'admin'
}

function isPublicUser(value: unknown): value is PublicUser {
  if (typeof value !== 'object' || value === null) return false

  return (
    'id' in value &&
    'name' in value &&
    'email' in value &&
    'role' in value &&
    'createdAt' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    isUserRole(value.role) &&
    typeof value.createdAt === 'string'
  )
}

function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const token = window.localStorage.getItem(AUTH_STORAGE_KEYS.token)
  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEYS.user)

  if (!token || !storedUser) return null

  try {
    const user: unknown = JSON.parse(storedUser)

    if (!isPublicUser(user)) {
      clearStoredSession()
      return null
    }

    return { token, user }
  } catch {
    clearStoredSession()
    return null
  }
}

function emitSession(session: AuthSession | null) {
  currentSession = session
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentSession
}

function saveSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token)
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user))
  emitSession(session)
}

export function useAuth() {
  const navigate = useNavigate()
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    emitSession(readSession())
  }, [])

  const login = async (payload: LoginPayload) => {
    const response = await apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: payload,
    })

    saveSession(response.data)
  }

  const register = async (payload: RegisterPayload) => {
    await apiRequest<ApiResponse<PublicUser>>('/auth/register', {
      method: 'POST',
      body: payload,
    })

    toast.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.')
    navigate('/login')
  }

  const logout = () => {
    clearStoredSession()
    emitSession(null)
    navigate('/login')
  }

  return {
    login,
    register,
    logout,
    session,
    isAuthenticated: Boolean(session),
    isAdmin: session?.user.role === 'admin',
  }
}
