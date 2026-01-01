/**
 * Token management utility
 * Handles JWT token storage and decoding
 */

interface TokenPayload {
  sub: string // user id
  email: string
  name: string
  isAdmin: boolean
  hasTempPassword?: boolean
  tempPasswordExpiresAt?: string | null
  iat: number // issued at
  exp: number // expires at
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  hasTempPassword?: boolean
  tempPasswordExpiresAt?: string | null
}

const TOKEN_KEY = 'taxisToken'

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Get user info from token
 */
export function getUserFromToken(token: string): User | null {
  const payload = decodeToken(token)
  if (!payload) return null

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    isAdmin: payload.isAdmin || false,
    hasTempPassword: payload.hasTempPassword || false,
    tempPasswordExpiresAt: payload.tempPasswordExpiresAt || null,
  }
}

/**
 * Store token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)

  // Clean up old separate storage items
  localStorage.removeItem('taxisUser')
  localStorage.removeItem('tokenExpiry')
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get valid token (null if expired or missing)
 */
export function getValidToken(): string | null {
  const token = getToken()
  if (!token) return null
  if (isTokenExpired(token)) {
    clearToken()
    return null
  }
  return token
}

/**
 * Get user from stored token
 */
export function getUser(): User | null {
  const token = getValidToken()
  if (!token) return null
  return getUserFromToken(token)
}

/**
 * Clear token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('taxisUser')
  localStorage.removeItem('tokenExpiry')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getValidToken() !== null
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const user = getUser()
  return user?.isAdmin || false
}
