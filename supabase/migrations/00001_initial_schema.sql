-- Migration: 00001_initial_schema

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

-- Tutorials table
CREATE TABLE public.tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    vdocipher_video_id TEXT NOT NULL,
    duration_seconds INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tutorial Assignments
CREATE TABLE public.tutorial_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_assignment UNIQUE NULLS NOT DISTINCT (tutorial_id, user_id, is_active)
);

-- Access Logs
CREATE TABLE public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Active Sessions (for Single Session Enforcement)
CREATE TABLE public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_hash TEXT NOT NULL UNIQUE,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
-- --------------------------------------------------------

-- Profiles
-- Admins can do everything
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Students can read their own profile
CREATE POLICY "Students can read own profile" ON public.profiles FOR SELECT TO authenticated USING (
    id = auth.uid()
);

-- Tutorials
-- Admins can do everything
CREATE POLICY "Admins can manage all tutorials" ON public.tutorials FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Students can read published tutorials assigned to them
CREATE POLICY "Students can read assigned published tutorials" ON public.tutorials FOR SELECT TO authenticated USING (
    is_published = true AND
    EXISTS (
        SELECT 1 FROM public.tutorial_assignments ta
        WHERE ta.tutorial_id = id
        AND ta.user_id = auth.uid()
        AND ta.is_active = true
        AND ta.starts_at <= now()
        AND (ta.expires_at IS NULL OR ta.expires_at > now())
    )
);

-- Assignments
-- Admins can do everything
CREATE POLICY "Admins can manage assignments" ON public.tutorial_assignments FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Students can read their own active assignments
CREATE POLICY "Students can read own assignments" ON public.tutorial_assignments FOR SELECT TO authenticated USING (
    user_id = auth.uid()
);

-- Access Logs
-- Admins can read all logs
CREATE POLICY "Admins can read logs" ON public.access_logs FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- No insert from client for access logs, managed by worker service role.

-- Active Sessions
-- Admins can read and manage sessions
CREATE POLICY "Admins can manage sessions" ON public.active_sessions FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Students can read their own session
CREATE POLICY "Students can read own session" ON public.active_sessions FOR SELECT TO authenticated USING (
    user_id = auth.uid()
);

-- --------------------------------------------------------
-- TRIGGERS
-- --------------------------------------------------------
-- Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at
    BEFORE UPDATE ON public.tutorials
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto create profile on auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
