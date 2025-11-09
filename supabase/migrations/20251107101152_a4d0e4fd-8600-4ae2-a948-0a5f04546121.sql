-- ============================================
-- Security Fix Migration: Telemetry RLS + room_members (Fixed)
-- ============================================

-- 1. Fix telemetry policies: Replace overly permissive SELECT policies
-- ============================================

-- Crew Telemetry
DROP POLICY IF EXISTS "Users can view all crew telemetry" ON public.crew_telemetry;

CREATE POLICY "crew_telemetry_select_scoped"
ON public.crew_telemetry FOR SELECT
USING (
  auth.uid() = user_id
  OR public.user_has_role('manager')
  OR public.user_has_role('super_admin')
);

-- Equipment Telemetry
DROP POLICY IF EXISTS "Users can view all equipment telemetry" ON public.equipment_telemetry;

CREATE POLICY "equipment_telemetry_select_scoped"
ON public.equipment_telemetry FOR SELECT
USING (
  auth.uid() = user_id
  OR public.user_has_role('manager')
  OR public.user_has_role('super_admin')
);

-- Job Telemetry  
DROP POLICY IF EXISTS "Users can view all job telemetry" ON public.job_telemetry;

CREATE POLICY "job_telemetry_select_scoped"
ON public.job_telemetry FOR SELECT
USING (
  auth.uid() = user_id
  OR public.user_has_role('manager')
  OR public.user_has_role('super_admin')
);

-- System Telemetry (restrict to admins only)
DROP POLICY IF EXISTS "Users can view all system telemetry" ON public.system_telemetry;

CREATE POLICY "system_telemetry_select_admin"
ON public.system_telemetry FOR SELECT
USING (
  public.user_has_role('manager')
  OR public.user_has_role('super_admin')
);

-- Tighten system telemetry INSERT to require user_id = auth.uid()
DROP POLICY IF EXISTS "Users can insert system telemetry" ON public.system_telemetry;

CREATE POLICY "system_telemetry_insert_scoped"
ON public.system_telemetry FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (public.user_has_role('manager') OR public.user_has_role('super_admin'))
);

-- 2. Enable RLS on room_members table
-- ============================================
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Users can view room members for rooms they're in
CREATE POLICY "room_members_select"
ON public.room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_members rm
    WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()
  )
  OR public.user_has_role('super_admin')
);

-- Users can insert themselves into rooms
CREATE POLICY "room_members_insert_self"
ON public.room_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can remove themselves from rooms
CREATE POLICY "room_members_delete_self"
ON public.room_members FOR DELETE
USING (
  user_id = auth.uid()
  OR public.user_has_role('super_admin')
);

-- Admins can manage room members
CREATE POLICY "room_members_update_admin"
ON public.room_members FOR UPDATE
USING (public.user_has_role('super_admin'));