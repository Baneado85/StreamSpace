import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { authMiddleware, requireAdmin, Env } from './auth'

const app = new Hono<Env>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.ALLOWED_ORIGIN || '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ==========================================
// STUDENT ENDPOINTS
// ==========================================

app.get('/api/me', authMiddleware, (c) => {
  return c.json({ profile: c.get('profile') })
})

app.post('/api/tutorials/:id/playback', authMiddleware, async (c) => {
  const tutorialId = c.req.param('id')
  const profile = c.get('profile')
  const supabase = c.get('supabase')

  // Check if assigned and published
  const { data: assignment, error } = await supabase
    .from('tutorial_assignments')
    .select(`
      *,
      tutorials!inner(id, vdocipher_video_id, is_published)
    `)
    .eq('user_id', profile.id)
    .eq('tutorial_id', tutorialId)
    .eq('is_active', true)
    .lte('starts_at', new Date().toISOString())
    .single()

  if (error || !assignment) {
    return c.json({ error: 'Access denied or tutorial not assigned' }, 403)
  }

  if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
    return c.json({ error: 'Access expired' }, 403)
  }

  if (!assignment.tutorials.is_published) {
    return c.json({ error: 'Tutorial not published' }, 403)
  }

  // Request VdoCipher OTP
  const videoId = assignment.tutorials.vdocipher_video_id
  const watermarkText = `${profile.full_name || 'Estudiante'} (${profile.email})`

  const vdoRes = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
    method: 'POST',
    headers: {
      'Authorization': `Apisecret ${c.env.VDOCIPHER_API_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ttl: 300,
      annotate: JSON.stringify([
        {
          type: 'text',
          text: watermarkText,
          alpha: '0.01', // Prácticamente invisible, solo por seguridad
          color: '0xFFFFFF',
          size: '10',
          x: '5',
          y: '5'
        }
      ])
    })
  })

  if (!vdoRes.ok) {
    console.error('VdoCipher error:', await vdoRes.text())
    return c.json({ error: 'Failed to generate playback credentials' }, 500)
  }

  const vdoData = await vdoRes.json() as any

  // Log access
  await supabase.from('access_logs').insert({
    user_id: profile.id,
    tutorial_id: tutorialId,
    event_type: 'playback_requested',
    user_agent: c.req.header('user-agent') || 'unknown'
  })

  return c.json({ otp: vdoData.otp, playbackInfo: vdoData.playbackInfo })
})

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

const adminApp = new Hono<Env>()
adminApp.use('*', authMiddleware, requireAdmin)

adminApp.get('/users', async (c) => {
  const supabase = c.get('supabase')
  const { data: users, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ users })
})

adminApp.post('/users', async (c) => {
  const supabase = c.get('supabase')
  const { email, password, full_name } = await c.req.json()
  
  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (authError) return c.json({ error: authError.message }, 400)
  
  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name, role: 'student', is_active: true })
    .eq('id', authData.user.id)
    
  if (profileError) return c.json({ error: profileError.message }, 400)
  return c.json({ message: 'User created' })
})

adminApp.patch('/users/:id', async (c) => {
  const supabase = c.get('supabase')
  const id = c.req.param('id')
  const { is_active } = await c.req.json()
  const { error } = await supabase.from('profiles').update({ is_active }).eq('id', id)
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Status updated' })
})

// Tutorials Management
adminApp.get('/tutorials', async (c) => {
  const supabase = c.get('supabase')
  const { data: tutorials, error } = await supabase.from('tutorials').select('*, tutorial_assignments(user_id)').order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ tutorials })
})

adminApp.post('/tutorials', async (c) => {
  const supabase = c.get('supabase')
  const { title, description, vdocipher_video_id } = await c.req.json()
  const { error } = await supabase.from('tutorials').insert({ title, description, vdocipher_video_id, is_published: true })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Tutorial created' })
})

// Assignments Management
adminApp.post('/assignments', async (c) => {
  const supabase = c.get('supabase')
  const { user_id, tutorial_id } = await c.req.json()
  const { error } = await supabase.from('tutorial_assignments').insert({ user_id, tutorial_id })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Assigned' })
})

adminApp.delete('/assignments', async (c) => {
  const supabase = c.get('supabase')
  const { user_id, tutorial_id } = await c.req.json()
  const { error } = await supabase.from('tutorial_assignments').delete().match({ user_id, tutorial_id })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Unassigned' })
})

app.route('/api/admin', adminApp)

export default app
