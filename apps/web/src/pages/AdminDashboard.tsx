import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { API_URL, fetchWithAuth } from '../lib/api'
import { Users, Video, Link as LinkIcon, Activity } from 'lucide-react'

export default function AdminDashboard({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-secondary p-4 flex flex-col">
        <h1 className="text-xl font-bold text-text mb-8 px-2">StreamSpace Admin</h1>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-muted hover:bg-secondary'}`}>
            <Users size={20} /> Estudiantes
          </button>
          <button onClick={() => setActiveTab('tutorials')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'tutorials' ? 'bg-primary text-white' : 'text-muted hover:bg-secondary'}`}>
            <Video size={20} /> Tutoriales
          </button>
        </nav>
        <div className="mt-auto border-t border-secondary pt-4 px-2">
          <p className="text-sm text-muted mb-2 truncate">{profile.email}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full px-3 py-2 bg-secondary hover:bg-red-900/50 hover:text-red-200 rounded-lg text-sm transition-colors text-left"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'tutorials' && <TutorialsManager />}
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestión de Estudiantes</h2>
      
      <div className="bg-surface p-6 rounded-xl border border-secondary mb-8">
        <h3 className="text-lg font-semibold mb-4">Añadir Nuevo Estudiante</h3>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-muted mb-1">Nombre Completo</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Contraseña (Temporal)</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button disabled={loading} type="submit" className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50">
              {loading ? 'Creando...' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface rounded-xl border border-secondary overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/50">
              <th className="p-4 font-medium text-muted">Nombre</th>
              <th className="p-4 font-medium text-muted">Correo</th>
              <th className="p-4 font-medium text-muted">Rol</th>
              <th className="p-4 font-medium text-muted">Estado</th>
              <th className="p-4 font-medium text-muted text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.users?.map((user: any) => (
              <tr key={user.id} className="border-t border-secondary">
                <td className="p-4">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4"><span className="px-2 py-1 bg-secondary rounded text-xs">{user.role}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.role === 'student' && (
                    <button 
                      onClick={() => toggleStatus(user.id, user.is_active)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestión de Tutoriales</h2>
      
      <div className="bg-surface p-6 rounded-xl border border-secondary mb-8">
        <h3 className="text-lg font-semibold mb-4">Añadir Nuevo Tutorial</h3>
        <form onSubmit={createTutorial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">Título del Tutorial</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">ID de VdoCipher (El código del video)</label>
            <input type="text" required value={videoId} onChange={e => setVideoId(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2 placeholder-secondary" placeholder="Ej: 123abc456def..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-muted mb-1">Descripción corta</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-secondary rounded px-3 py-2" rows={2}></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={loading} type="submit" className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2">
              <Video size={18} /> {loading ? 'Guardando...' : 'Guardar Tutorial'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutorialsData?.tutorials?.map((tutorial: any) => (
          <div key={tutorial.id} className="bg-surface p-5 rounded-xl border border-secondary flex flex-col">
            <h4 className="font-bold text-lg">{tutorial.title}</h4>
            <p className="text-sm text-muted mb-4 flex-1">{tutorial.description}</p>
            
            <div className="bg-background rounded p-3 mb-4">
              <p className="text-xs text-muted mb-2 font-semibold">ESTUDIANTES ASIGNADOS:</p>
              {tutorial.tutorial_assignments?.length === 0 ? (
                <span className="text-sm text-secondary">Nadie tiene acceso a este video aún.</span>
              ) : (
                <ul className="space-y-1">
                  {tutorial.tutorial_assignments?.map((assign: any) => {
                    const student = usersData?.users?.find((u: any) => u.id === assign.user_id)
                    return (
                      <li key={assign.user_id} className="flex justify-between items-center text-sm">
                        <span>{student?.full_name || student?.email || 'Estudiante'}</span>
                        <button onClick={() => removeAssignment(tutorial.id, assign.user_id)} className="text-red-400 hover:text-red-300 text-xs">Retirar</button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {assigningTo === tutorial.id ? (
              <form onSubmit={assignTutorial} className="flex gap-2">
                <select 
                  required 
                  value={selectedUser} 
                  onChange={e => setSelectedUser(e.target.value)}
                  className="flex-1 bg-background border border-secondary rounded px-2 text-sm"
                >
                  <option value="">Seleccionar estudiante...</option>
                  {usersData?.users?.filter((u: any) => u.role === 'student').map((user: any) => (
                    <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                  ))}
                </select>
                <button type="submit" className="bg-primary px-3 py-1 rounded text-sm text-white hover:bg-blue-600">Dar Acceso</button>
                <button type="button" onClick={() => setAssigningTo(null)} className="bg-secondary px-3 py-1 rounded text-sm text-white hover:bg-muted">X</button>
              </form>
            ) : (
              <button onClick={() => setAssigningTo(tutorial.id)} className="w-full py-2 bg-secondary/50 hover:bg-secondary rounded text-sm transition-colors flex items-center justify-center gap-2">
                <LinkIcon size={16} /> Asignar a un estudiante
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
