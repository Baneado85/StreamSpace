import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '../lib/api'
import SecurePlayer from '../components/SecurePlayer'
import { PlayCircle, ArrowLeft } from 'lucide-react'

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
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="bg-surface border-b border-secondary p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          {activeVideo && (
            <button onClick={closePlayer} className="text-muted hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Volver
            </button>
          )}
          <h1 className="text-xl font-bold text-text">{activeVideo ? activeVideo.title : 'Mis Tutoriales'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted">Hola, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Estudiante'}</span>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-3 py-1 bg-secondary hover:bg-muted hover:text-surface rounded text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        {activeVideo ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl">
              {loadingVideo ? (
                <div className="w-full aspect-video bg-surface flex items-center justify-center rounded-lg border border-secondary animate-pulse">
                  <p className="text-muted">Desencriptando video seguro...</p>
                </div>
              ) : playbackData ? (
                <SecurePlayer otp={playbackData.otp} playbackInfo={playbackData.playbackInfo} email={profile?.email || 'Estudiante'} />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            {tutorials?.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-xl border border-secondary">
                <PlayCircle size={48} className="mx-auto text-muted mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Aún no tienes tutoriales asignados</h3>
                <p className="text-muted">Comunícate con el administrador para que te dé acceso a los videos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tutorials?.map((tutorial: any) => (
                  <div 
                    key={tutorial.id} 
                    onClick={() => playTutorial(tutorial)}
                    className="bg-surface rounded-xl overflow-hidden border border-secondary hover:border-primary cursor-pointer transition-all hover:-translate-y-1 group"
                  >
                    <div className="aspect-video bg-secondary/30 relative flex items-center justify-center">
                      <PlayCircle size={48} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{tutorial.title}</h3>
                      <p className="text-muted text-sm line-clamp-2">{tutorial.description}</p>
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
