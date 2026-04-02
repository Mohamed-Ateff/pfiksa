-- ============================================================
-- Daily Report Studio — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor (one shot)
-- ============================================================

-- ─── PROFILES TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT 'employee'
                          CHECK (role IN ('employee', 'manager')),
  position    TEXT        DEFAULT '',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies that do NOT use get_my_role() go here
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_service"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ─── HELPER FUNCTION ─────────────────────────────────────────
-- Must come AFTER the table AND before any policy that calls it
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── REMAINING PROFILES POLICIES (need get_my_role) ──────────
CREATE POLICY "profiles_update_manager"
  ON public.profiles FOR UPDATE
  USING (get_my_role() = 'manager');

-- ─── REPORTS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date              DATE        NOT NULL DEFAULT CURRENT_DATE,
  completed_tasks   TEXT        DEFAULT '',
  in_progress_tasks TEXT        DEFAULT '',
  commitments       TEXT        DEFAULT '',
  challenges        TEXT        DEFAULT '',
  files             JSONB       DEFAULT '[]'::jsonb,
  is_checked        BOOLEAN     NOT NULL DEFAULT FALSE,
  approval_note     TEXT        DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "reports_select"
  ON public.reports FOR SELECT
  USING (auth.uid() = employee_id OR get_my_role() = 'manager');

CREATE POLICY "reports_delete"
  ON public.reports FOR DELETE
  USING (auth.uid() = employee_id OR get_my_role() = 'manager');

CREATE POLICY "reports_update_manager"
  ON public.reports FOR UPDATE
  USING (get_my_role() = 'manager');

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'position', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block user creation even if profile insert fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── STORAGE BUCKET ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "storage_read_authenticated"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── REALTIME ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

