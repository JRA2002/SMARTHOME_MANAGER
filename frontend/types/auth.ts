export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  fullname: string
  password: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface User {
  id: number
  email: string
  fullname: string
  is_active: boolean
  created_at: string
}

export interface UserUpdate {
  fullname?: string
  email?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}