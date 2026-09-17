import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '../lib/api'
import SecurePlayer from '../components/SecurePlayer'
import { PlayCircle, ArrowLeft, LogOut, Video } from 'lucide-react'

export default function StudentDashboard({ profile }: { profile: any }) {
  const [activeVideo, setActiveVideo] = useState<{ id: string, title: string } | null>(null)
  const [playbackData, setPlaybackData] = useState<{ otp: string, playbackInfo: string } | null>(null)
  const [loadingVideo, setLoadingVideo] = useState(false)

  // Fetch only tutorials assigned to this student (handled securely by RLS)
  const { data: tutorials } = useQuery({
    queryKey: ['student-tutorials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tutorials').select('*').order('position', { ascending: true })
      if (error) throw error
      return data
    }
  })

  const playTutorial = async (tutorial: any) => {
    setActiveVideo({ id: tutorial.id, title: tutorial.title })
    setPlaybackData(null)
    setLoadingVideo(true)
    
    try {
      const data = await fetchWithAuth(`/api/tutorials/${tutorial.id}/playback`, {
        method: 'POST'
      })
      if (data.error) throw new Error(data.error)
      setPlaybackData({ otp: data.otp, playbackInfo: data.playbackInfo })
    } catch (err: any) {
      alert("Error al cargar el video: " + err.message)
      setActiveVideo(null)
    }
    setLoadingVideo(false)
  }

  const closePlayer = () => {
    setActiveVideo(null)
    setPlaybackData(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeVideo ? (
              <button onClick={closePlayer} className="flex items-center gap-2 text-muted hover:text-white transition-colors py-2 px-3 hover:bg-surface-hover rounded-lg">
                <ArrowLeft size={18} />
                <span className="font-medium">Volver a Cursos</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="StreamSpace" className="w-9 h-9 rounded-lg object-cover border border-border" />
                <h1 className="text-xl font-bold neon-text-gradient hidden sm:block">StreamSpace</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-sm shadow-lg">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'E'}
              </div>
              <span className="text-sm font-medium hidden sm:block text-text-dim">
                {profile?.full_name?.split(' ')[0] || 'Estudiante'}
              </span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-muted hover:text-red-400 transition-colors p-2 hover:bg-surface-hover rounded-lg flex items-center gap-2"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
              <span className="hidden sm:block text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {activeVideo ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <div className="w-full h-full max-w-6xl mx-auto md:p-6 flex flex-col">
              <div className="mb-4 px-4 md:px-0">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Video className="text-primary" size={24} />
                  {activeVideo.title}
                </h2>
              </div>
              <div className="flex-1 w-full bg-[#0a0a0a] md:rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                {loadingVideo ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface animate-pulse">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary font-medium">Conectando al servidor seguro...</p>
                  </div>
                ) : playbackData ? (
                  <SecurePlayer otp={playbackData.otp} playbackInfo={playbackData.playbackInfo} email={profile?.email || 'Estudiante'} />
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Clases Disponibles</h2>
              <p className="text-muted">Selecciona un módulo para comenzar a aprender.</p>
            </div>

            {tutorials?.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-3xl border border-border shadow-lg">
                <PlayCircle size={64} className="mx-auto text-muted mb-6 opacity-30" />
                <h3 className="text-2xl font-semibold mb-3 text-text">Sin Cursos Activos</h3>
                <p className="text-muted max-w-md mx-auto">Parece que aún no tienes módulos asignados o tu acceso ha expirado. Contacta a soporte para reactivarlo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tutorials?.map((tutorial: any) => (
                  <div 
                    key={tutorial.id} 
                    onClick={() => playTutorial(tutorial)}
                    className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-border cursor-pointer hover:neon-glow transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="aspect-video bg-surface-hover relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60 z-10"></div>
                      <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-primary/50">
                        <PlayCircle size={32} className="text-white group-hover:text-primary transition-colors" fill="currentColor" />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-text group-hover:text-primary transition-colors line-clamp-2">{tutorial.title}</h3>
                      <p className="text-muted text-sm line-clamp-2 flex-1">{tutorial.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

