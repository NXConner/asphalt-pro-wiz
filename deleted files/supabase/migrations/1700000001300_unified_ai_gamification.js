/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- AI detections
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS public.ai_asphalt_detections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      job_site_id uuid REFERENCES public.job_sites(id) ON DELETE SET NULL,
      source text NOT NULL CHECK (source in ('upload','map_view')),
      image_width integer,
      image_height integer,
      map_lat double precision,
      map_lng double precision,
      map_zoom integer,
      roi jsonb,
      condition text,
      confidence_score integer CHECK (confidence_score BETWEEN 0 AND 100),
      area_sqft numeric,
      area_sqm numeric,
      estimated_crack_length_ft numeric,
      priority text,
      estimated_repair_cost text,
      ai_notes text,
      analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_det_org ON public.ai_asphalt_detections(org_id);
    CREATE INDEX IF NOT EXISTS idx_ai_det_user_created ON public.ai_asphalt_detections (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_det_job_created ON public.ai_asphalt_detections (job_site_id, created_at DESC);

    -- Gamification
    CREATE TABLE IF NOT EXISTS public.game_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      event_type text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      idempotency_key text UNIQUE,
      device_id text,
      lat double precision,
      lng double precision,
      metadata jsonb
    );

    CREATE TABLE IF NOT EXISTS public.game_profiles (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      points integer NOT NULL DEFAULT 0,
      xp integer NOT NULL DEFAULT 0,
      level integer NOT NULL DEFAULT 1,
      streak_current integer NOT NULL DEFAULT 0,
      streak_longest integer NOT NULL DEFAULT 0,
      last_event_date date,
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.game_badges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      badge_code text NOT NULL,
      title text,
      description text,
      earned_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, badge_code)
    );

    CREATE TABLE IF NOT EXISTS public.game_quests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      quest_code text NOT NULL,
      status text NOT NULL DEFAULT 'active',
      progress jsonb NOT NULL DEFAULT '{}'::jsonb,
      started_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz,
      UNIQUE (user_id, quest_code)
    );

    CREATE TABLE IF NOT EXISTS public.game_redemptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      reward_code text NOT NULL,
      metadata jsonb,
      redeemed_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE OR REPLACE VIEW public.game_leaderboard AS
      SELECT user_id, points, xp, level, streak_current, streak_longest, updated_at
      FROM public.game_profiles;

    GRANT SELECT ON public.game_leaderboard TO anon, authenticated;

    -- Helper RPC for quest progress (idempotent upsert and increment)
    CREATE OR REPLACE FUNCTION public.upsert_quest_progress(
      p_user_id uuid,
      p_code text,
      p_key text,
      p_inc integer
    ) RETURNS void LANGUAGE plpgsql AS $$
    BEGIN
      INSERT INTO public.game_quests(user_id, org_id, quest_code, progress)
      SELECT p_user_id, org_id, p_code, jsonb_build_object(p_key, p_inc)
      FROM public.user_org_memberships
      WHERE user_id = p_user_id
      ORDER BY created_at ASC
      LIMIT 1
      ON CONFLICT (user_id, quest_code)
      DO UPDATE SET progress = coalesce(public.game_quests.progress, '{}'::jsonb) || jsonb_build_object(
        p_key,
        coalesce( (public.game_quests.progress->>p_key)::int, 0 ) + p_inc
      );
    END;$$;

    -- Attach common triggers
    DO $$
    DECLARE t text;
    BEGIN
      FOR t IN SELECT unnest(ARRAY['ai_asphalt_detections','game_events','game_profiles','game_badges','game_quests','game_redemptions']) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I;', 'set_org_and_created_by_'||t, t);
        EXECUTE format('CREATE TRIGGER %I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();', 'set_org_and_created_by_'||t, t);
      END LOOP;
    END$$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Non-destructive down migration for safety (no-op)
  `);
};
