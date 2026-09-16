import React from 'react'
import { supabase } from '../lib/supabase'

export default function StudentDashboard({ profile }: { profile: any }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-secondary p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-text">Mis Tutoriales</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted">Hola, {profile.full_name.split(' ')[0]}</span>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-3 py-1 bg-secondary hover:bg-muted hover:text-surface rounded text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      <main className="p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skeleton or list of tutorials will go here */}
          <div className="text-muted col-span-full text-center py-12">
            No tienes tutoriales asignados actualmente.
          </div>
        </div>
      </main>
    </div>
  )
}
