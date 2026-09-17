import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '../lib/api'
import { Users, Video, Link as LinkIcon, LogOut, PlusCircle } from 'lucide-react'

export default function AdminDashboard({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header (Top Nav) */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="StreamSpace" className="w-9 h-9 rounded-lg object-cover border border-border" />
              <h1 className="text-xl font-bold neon-text-gradient hidden sm:block">StreamSpace Admin</h1>
            </div>
            {/* Tabs */}
            <nav className="hidden md:flex items-center gap-2 border-l border-border pl-6">
              <button 
                onClick={() => setActiveTab('users')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'users' ? 'bg-primary/10 text-primary neon-glow-strong' : 'text-muted hover:text-text hover:bg-surface-hover'}`}
              >
                <Users size={18} /> Estudiantes
              </button>
              <button 
                onClick={() => setActiveTab('tutorials')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'tutorials' ? 'bg-primary/10 text-primary neon-glow-strong' : 'text-muted hover:text-text hover:bg-surface-hover'}`}
              >
                <Video size={18} /> Tutoriales
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-sm shadow-lg text-white">
                A
              </div>
              <span className="text-sm font-medium hidden sm:block text-text-dim">
                {profile?.email}
              </span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-muted hover:text-red-400 transition-colors p-2 hover:bg-surface-hover rounded-lg flex items-center gap-2"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex border-t border-border">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 transition-colors font-medium text-sm ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
          >
            <Users size={16} /> Estudiantes
          </button>
          <button 
            onClick={() => setActiveTab('tutorials')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 transition-colors font-medium text-sm ${activeTab === 'tutorials' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
          >
            <Video size={16} /> Tutoriales
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'tutorials' && <TutorialsManager />}
        </div>
      </main>
    </div>
  )
}

function UsersManager() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchWithAuth('/api/admin/users')
  })

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName })
      })
      setEmail('')
      setPassword('')
      setFullName('')
      refetch()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      })
      refetch()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Comunidad y Estudiantes</h2>
          <p className="text-muted">Gestiona el acceso de tus alumnos a la plataforma.</p>
        </div>
      </div>
      
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg mb-8">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-white">Añadir Nuevo Estudiante</h3>
        </div>
        {error && <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Nombre Completo</label>
            <input type="text" required placeholder="Ej: Juan Pérez" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Correo Electrónico</label>
            <input type="email" required placeholder="juan@correo.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Contraseña (Temporal)</label>
            <input type="password" required minLength={6} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button disabled={loading} type="submit" className="neon-border bg-surface-hover hover:bg-surface text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10">{loading ? 'Creando...' : 'Crear Estudiante'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="p-5 font-semibold text-text-dim text-sm uppercase tracking-wider">Nombre</th>
                <th className="p-5 font-semibold text-text-dim text-sm uppercase tracking-wider">Correo</th>
                <th className="p-5 font-semibold text-text-dim text-sm uppercase tracking-wider">Rol</th>
                <th className="p-5 font-semibold text-text-dim text-sm uppercase tracking-wider">Estado</th>
                <th className="p-5 font-semibold text-text-dim text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 font-medium text-white">{user.full_name}</td>
                  <td className="p-5 text-muted">{user.email}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface-hover border-border text-text-dim'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Estudiante'}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-2 ${user.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      {user.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {user.role === 'student' && (
                      <button 
                        onClick={() => toggleStatus(user.id, user.is_active)}
                        className={`text-sm font-medium transition-colors hover:underline ${user.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                      >
                        {user.is_active ? 'Suspender' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.users || data.users.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">No hay usuarios registrados aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TutorialsManager() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoId, setVideoId] = useState('')
  const [loading, setLoading] = useState(false)
  
  // For assignment modal
  const [assigningTo, setAssigningTo] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState('')

  const { data: tutorialsData, refetch: refetchTutorials } = useQuery({
    queryKey: ['admin-tutorials'],
    queryFn: () => fetchWithAuth('/api/admin/tutorials')
  })

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchWithAuth('/api/admin/users')
  })

  const createTutorial = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetchWithAuth('/api/admin/tutorials', {
        method: 'POST',
        body: JSON.stringify({ title, description, vdocipher_video_id: videoId })
      })
      setTitle('')
      setDescription('')
      setVideoId('')
      refetchTutorials()
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  const assignTutorial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningTo || !selectedUser) return
    try {
      await fetchWithAuth('/api/admin/assignments', {
        method: 'POST',
        body: JSON.stringify({ tutorial_id: assigningTo, user_id: selectedUser })
      })
      setAssigningTo(null)
      setSelectedUser('')
      refetchTutorials()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const removeAssignment = async (tutorialId: string, userId: string) => {
    try {
      await fetchWithAuth('/api/admin/assignments', {
        method: 'DELETE',
        body: JSON.stringify({ tutorial_id: tutorialId, user_id: userId })
      })
      refetchTutorials()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Clases y Módulos</h2>
        <p className="text-muted">Crea contenido seguro y asígnalo a tus alumnos.</p>
      </div>
      
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg mb-8">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-white">Subir Nuevo Tutorial</h3>
        </div>
        <form onSubmit={createTutorial} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">Título de la Clase</label>
            <input type="text" required placeholder="Ej: Clase 01: Introducción" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dim mb-2">ID Seguro (VdoCipher)</label>
            <input type="text" required value={videoId} onChange={e => setVideoId(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ej: 123abc456def..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-dim mb-2">Descripción (Opcional)</label>
            <textarea value={description} placeholder="Detalles de la clase..." onChange={e => setDescription(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" rows={3}></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button disabled={loading} type="submit" className="neon-border bg-surface-hover hover:bg-surface text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2"><Video size={18} /> {loading ? 'Guardando...' : 'Publicar Clase'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutorialsData?.tutorials?.map((tutorial: any) => (
          <div key={tutorial.id} className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-1">
                  <Video size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-1">{tutorial.title}</h4>
                  <p className="text-sm text-muted line-clamp-3">{tutorial.description || 'Sin descripción'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex-1">
                <div className="bg-background/80 rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-text-dim mb-3 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} /> Estudiantes con Acceso
                  </p>
                  {tutorial.tutorial_assignments?.length === 0 ? (
                    <div className="text-sm text-muted italic bg-surface-hover/50 p-3 rounded-lg text-center">Nadie tiene acceso a esta clase aún.</div>
                  ) : (
                    <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {tutorial.tutorial_assignments?.map((assign: any) => {
                        const student = usersData?.users?.find((u: any) => u.id === assign.user_id)
                        return (
                          <li key={assign.user_id} className="flex justify-between items-center text-sm bg-surface-hover px-3 py-2 rounded-lg border border-border/50">
                            <span className="font-medium text-text-dim truncate mr-2">{student?.full_name || student?.email || 'Estudiante'}</span>
                            <button onClick={() => removeAssignment(tutorial.id, assign.user_id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-md transition-colors shrink-0" title="Revocar Acceso">
                              <LogOut size={14} />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-hover border-t border-border mt-auto">
              {assigningTo === tutorial.id ? (
                <form onSubmit={assignTutorial} className="flex gap-2">
                  <select 
                    required 
                    value={selectedUser} 
                    onChange={e => setSelectedUser(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  >
                    <option value="">Seleccionar alumno...</option>
                    {usersData?.users?.filter((u: any) => u.role === 'student').map((user: any) => (
                      <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                    ))}
                  </select>
                  <button type="submit" className="bg-primary px-4 py-2 rounded-lg text-sm font-semibold text-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">Permitir</button>
                  <button type="button" onClick={() => setAssigningTo(null)} className="bg-background border border-border px-4 py-2 rounded-lg text-sm font-semibold text-text hover:bg-border transition-all">Cancelar</button>
                </form>
              ) : (
                <button onClick={() => setAssigningTo(tutorial.id)} className="w-full py-2.5 bg-background border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 text-primary">
                  <LinkIcon size={16} /> Otorgar Acceso
                </button>
              )}
            </div>
          </div>
        ))}
        {(!tutorialsData?.tutorials || tutorialsData.tutorials.length === 0) && (
          <div className="lg:col-span-2 text-center py-20 border border-dashed border-border rounded-2xl">
            <Video size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-text-dim text-lg">Aún no has creado ninguna clase.</p>
          </div>
        )}
      </div>
    </div>
  )
}

