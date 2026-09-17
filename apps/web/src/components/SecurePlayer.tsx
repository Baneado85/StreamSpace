import { useEffect, useRef, useState } from 'react'

interface SecurePlayerProps {
  otp: string
  playbackInfo: string
  email: string
}

export default function SecurePlayer({ otp, playbackInfo, email }: SecurePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error("Error toggling fullscreen", err)
    }
  }

  useEffect(() => {
    // Anti-piracy: Disable right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)

    // Anti-piracy: Keyboard shortcuts prevention (best effort on web)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen, F12, Ctrl+S, Ctrl+U
      if (
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p' || e.key === 'c')) ||
        (e.metaKey && (e.key === 's' || e.key === 'u' || e.key === 'p' || e.key === 'c'))
      ) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-black rounded-lg overflow-hidden select-none group ${isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video'}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Custom Fullscreen Button that appears on hover */}
      <button 
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isFullscreen ? (
            <>
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </>
          ) : (
            <>
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </>
          )}
        </svg>
        {isFullscreen ? 'Salir' : 'Pantalla Completa'}
      </button>

      {/* VdoCipher iframe */}
      <iframe
        src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
        style={{ border: 0, width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
        allow="encrypted-media"
      ></iframe>
      
      {/* Diagonal Repeating Watermark Overlay */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden flex items-center justify-center"
        onContextMenu={e => e.preventDefault()}
      >
        <div 
          className="absolute w-[150%] h-[150%] flex flex-wrap gap-8 items-center justify-center opacity-30"
          style={{ transform: 'rotate(-35deg)' }}
        >
          {Array.from({ length: 150 }).map((_, i) => (
            <span key={i} className="text-white text-lg font-bold whitespace-nowrap">
              {email}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
