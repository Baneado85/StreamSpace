import React from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none translate-x-20"></div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-surface/80 backdrop-blur-xl rounded-2xl border border-border shadow-2xl neon-glow">
        
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpg" alt="StreamSpace Logo" className="w-24 h-24 rounded-2xl shadow-lg mb-4 object-cover border-2 border-border/50" />
          <h1 className="text-3xl font-bold text-center neon-text-gradient mb-1">StreamSpace</h1>
          <p className="text-muted text-sm">Academia Privada</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="tu@correo.com"
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            type="submit"
            className="w-full neon-border bg-surface-hover hover:bg-surface text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 mt-4 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative z-10">{loading ? 'Cargando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
