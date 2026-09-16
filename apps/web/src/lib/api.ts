export const API_URL = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787'

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const sessionString = localStorage.getItem('sb-' + new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0] + '-auth-token')
  let token = ''
  if (sessionString) {
    try {
      const session = JSON.parse(sessionString)
      token = session.access_token
    } catch(e) {}
  }

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  headers.set('Content-Type', 'application/json')

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'API Error')
  }

  return res.json()
}
