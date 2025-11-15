-- ============================================
-- TELEMETRY TABLES FOR OPERATIONAL TRACKING
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREW TELEMETRY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('shift_start', 'shift_end', 'break', 'job_assigned', 'job_completed', 'location_update', 'status_change')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break', 'off_duty')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crew_telemetry_crew_id ON public.crew_telemetry(crew_id);
CREATE INDEX idx_crew_telemetry_user_id ON public.crew_telemetry(user_id);
CREATE INDEX idx_crew_telemetry_event_type ON public.crew_telemetry(event_type);
CREATE INDEX idx_crew_telemetry_created_at ON public.crew_telemetry(created_at DESC);

-- ============================================
-- 2. JOB TELEMETRY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_changed', 'assigned', 'started', 'paused', 'completed', 'cancelled', 'estimate_generated')),
  status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  quote_value DECIMAL(12, 2),
  area_sqft DECIMAL(12, 2),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  customer_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_telemetry_job_id ON public.job_telemetry(job_id);
CREATE INDEX idx_job_telemetry_user_id ON public.job_telemetry(user_id);
CREATE INDEX idx_job_telemetry_event_type ON public.job_telemetry(event_type);
CREATE INDEX idx_job_telemetry_status ON public.job_telemetry(status);
CREATE INDEX idx_job_telemetry_created_at ON public.job_telemetry(created_at DESC);

-- ============================================
-- 3. EQUIPMENT TELEMETRY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.equipment_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('usage_start', 'usage_end', 'maintenance', 'repair', 'status_change', 'location_update')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  hours_used DECIMAL(8, 2),
  fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_telemetry_equipment_id ON public.equipment_telemetry(equipment_id);
CREATE INDEX idx_equipment_telemetry_user_id ON public.equipment_telemetry(user_id);
CREATE INDEX idx_equipment_telemetry_event_type ON public.equipment_telemetry(event_type);
CREATE INDEX idx_equipment_telemetry_status ON public.equipment_telemetry(status);
CREATE INDEX idx_equipment_telemetry_created_at ON public.equipment_telemetry(created_at DESC);

-- ============================================
-- 4. SYSTEM TELEMETRY TABLE (General Events)
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_category TEXT CHECK (event_category IN ('system', 'user_action', 'error', 'warning', 'info', 'audit')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_telemetry_user_id ON public.system_telemetry(user_id);
CREATE INDEX idx_system_telemetry_event_type ON public.system_telemetry(event_type);
CREATE INDEX idx_system_telemetry_category ON public.system_telemetry(event_category);
CREATE INDEX idx_system_telemetry_severity ON public.system_telemetry(severity);
CREATE INDEX idx_system_telemetry_created_at ON public.system_telemetry(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.crew_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_telemetry ENABLE ROW LEVEL SECURITY;

-- Crew Telemetry Policies
CREATE POLICY "Users can view all crew telemetry"
  ON public.crew_telemetry FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own crew telemetry"
  ON public.crew_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crew telemetry"
  ON public.crew_telemetry FOR UPDATE
  USING (auth.uid() = user_id);

-- Job Telemetry Policies
CREATE POLICY "Users can view all job telemetry"
  ON public.job_telemetry FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own job telemetry"
  ON public.job_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job telemetry"
  ON public.job_telemetry FOR UPDATE
  USING (auth.uid() = user_id);

-- Equipment Telemetry Policies
CREATE POLICY "Users can view all equipment telemetry"
  ON public.equipment_telemetry FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own equipment telemetry"
  ON public.equipment_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment telemetry"
  ON public.equipment_telemetry FOR UPDATE
  USING (auth.uid() = user_id);

-- System Telemetry Policies
CREATE POLICY "Users can view all system telemetry"
  ON public.system_telemetry FOR SELECT
  USING (true);

CREATE POLICY "Users can insert system telemetry"
  ON public.system_telemetry FOR INSERT
  WITH CHECK (true);

-- ============================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crew_telemetry_updated_at
  BEFORE UPDATE ON public.crew_telemetry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_telemetry_updated_at
  BEFORE UPDATE ON public.job_telemetry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_telemetry_updated_at
  BEFORE UPDATE ON public.equipment_telemetry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();