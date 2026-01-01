import { getToken, clearToken } from './auth-token'

/**
 * Fetch wrapper that automatically includes the auth token
 * and handles 401 errors by logging out
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const headers = new Headers(options.headers || {})
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // If token expired or unauthorized, clear auth and redirect to login
  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
  }

  return response
}
