import { Context, Next } from 'hono'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Env = {
  Bindings: {
    VITE_SUPABASE_URL: string
    VITE_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    VDOCIPHER_API_SECRET: string
    ALLOWED_ORIGIN: string
    IP_HASH_SALT: string
  }
  Variables: {
    supabase: SupabaseClient
    user: any
    profile: any
  }
}

export const authMiddleware = async (c: Context<Env>, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.VITE_SUPABASE_ANON_KEY)
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // Get profile using service role to bypass RLS for checking role
  if (!c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el .env' }, 500)
  }

  const supabaseAdmin = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return c.json({ error: 'Profile not found' }, 404)
  }

  if (!profile.is_active) {
    return c.json({ error: 'Account is deactivated' }, 403)
  }

  c.set('supabase', supabaseAdmin) // Pass admin client to routes
  c.set('user', user)
  c.set('profile', profile)

  await next()
}

export const requireAdmin = async (c: Context<Env>, next: Next) => {
  const profile = c.get('profile')
  if (profile.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admins only' }, 403)
  }
  await next()
}
