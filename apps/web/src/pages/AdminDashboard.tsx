import React from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard({ profile }: { profile: any }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-secondary p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-text">StreamSpace Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted">{profile.email}</span>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-3 py-1 bg-secondary hover:bg-muted hover:text-surface rounded text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard (Admin)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-secondary p-6 rounded-xl shadow-lg">
            <h3 className="text-muted mb-2">Estudiantes</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-surface border border-secondary p-6 rounded-xl shadow-lg">
            <h3 className="text-muted mb-2">Tutoriales</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-surface border border-secondary p-6 rounded-xl shadow-lg">
            <h3 className="text-muted mb-2">Asignaciones Activas</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </main>
    </div>
  )
}
