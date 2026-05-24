export type UserRole = 'user' | 'admin'

export type PublicUser = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: PublicUser
}

export type AuthSession = {
  token: string
  user: PublicUser
}
