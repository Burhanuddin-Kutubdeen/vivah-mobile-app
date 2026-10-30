-- ==============================================================================
-- MIGRATION: ENFORCE OPPOSITE-GENDER DISCOVERY, RLS POLICIES & CONSTRAINTS
-- ==============================================================================

-- 1. Create table for user blocks (both directions) if not existing
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- 2. Create table for user profile swipes/passes
CREATE TABLE IF NOT EXISTS public.profile_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passed_profile_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, passed_profile_id)
);

-- 3. Postgres function `discover_profiles` returning ONLY opposite-gender profiles
CREATE OR REPLACE FUNCTION public.discover_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_gender TEXT;
  opposite_gender TEXT;
  calling_uid UUID := auth.uid();
BEGIN
  -- Retrieve calling user's gender
  SELECT gender INTO calling_user_gender
  FROM public.profiles
  WHERE user_id = calling_uid OR id = calling_uid
  LIMIT 1;

  -- Determine opposite gender
  IF calling_user_gender = 'Male' THEN
    opposite_gender := 'Female';
  ELSIF calling_user_gender = 'Female' THEN
    opposite_gender := 'Male';
  ELSE
    -- Default fallback if gender not specified
    opposite_gender := 'Female';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.gender = opposite_gender
    AND p.user_id != calling_uid
    AND p.id != calling_uid
    -- Exclude unverified or deactivated profiles
    AND COALESCE(p.verified, true) = true
    -- Exclude blocked users (both directions)
    AND p.user_id NOT IN (
      SELECT blocked_id FROM public.user_blocks WHERE blocker_id = calling_uid
      UNION
      SELECT blocker_id FROM public.user_blocks WHERE blocked_id = calling_uid
    )
    -- Exclude already liked profiles
    AND p.id NOT IN (
      SELECT receiver_id FROM public.connection_requests WHERE sender_id = calling_uid
    )
    -- Exclude already passed profiles
    AND p.id NOT IN (
      SELECT passed_profile_id FROM public.profile_passes WHERE user_id = calling_uid
    );
END;
$$;

-- 4. Row Level Security Policies enforcing opposite-gender filtering at database level
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check opposite gender compatibility
CREATE OR REPLACE FUNCTION public.is_opposite_gender(target_gender TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  caller_gender TEXT;
BEGIN
  SELECT gender INTO caller_gender
  FROM public.profiles
  WHERE user_id = auth.uid() OR id = auth.uid()
  LIMIT 1;

  IF caller_gender = 'Male' AND target_gender = 'Female' THEN RETURN TRUE; END IF;
  IF caller_gender = 'Female' AND target_gender = 'Male' THEN RETURN TRUE; END IF;

  -- Allow users to always read their own profile
  RETURN FALSE;
END;
$$;

-- RLS Policy: Users can only read opposite-gender profiles or their own profile
DROP POLICY IF EXISTS "Opposite gender profile lookup" ON public.profiles;
CREATE POLICY "Opposite gender profile lookup"
ON public.profiles
FOR SELECT
USING (
  (user_id = auth.uid() OR id = auth.uid())
  OR
  public.is_opposite_gender(gender)
);

-- 5. Trigger preventing same-gender likes
CREATE OR REPLACE FUNCTION public.check_like_gender_constraint()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sender_g TEXT;
  receiver_g TEXT;
BEGIN
  SELECT gender INTO sender_g FROM public.profiles WHERE id = NEW.sender_id OR user_id = NEW.sender_id LIMIT 1;
  SELECT gender INTO receiver_g FROM public.profiles WHERE id = NEW.receiver_id OR user_id = NEW.receiver_id LIMIT 1;

  IF sender_g IS NOT NULL AND receiver_g IS NOT NULL AND sender_g = receiver_g THEN
    RAISE EXCEPTION 'Same-gender likes are strictly prohibited by system rules.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_same_gender_like ON public.connection_requests;
CREATE TRIGGER trg_prevent_same_gender_like
BEFORE INSERT OR UPDATE ON public.connection_requests
FOR EACH ROW
EXECUTE FUNCTION public.check_like_gender_constraint();

-- 6. Trigger preventing same-gender conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL,
  participant2_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

CREATE OR REPLACE FUNCTION public.check_conversation_gender_constraint()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  p1_g TEXT;
  p2_g TEXT;
BEGIN
  SELECT gender INTO p1_g FROM public.profiles WHERE id = NEW.participant1_id OR user_id = NEW.participant1_id LIMIT 1;
  SELECT gender INTO p2_g FROM public.profiles WHERE id = NEW.participant2_id OR user_id = NEW.participant2_id LIMIT 1;

  IF p1_g IS NOT NULL AND p2_g IS NOT NULL AND p1_g = p2_g THEN
    RAISE EXCEPTION 'Same-gender conversations are strictly prohibited by system rules.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_same_gender_conversation ON public.conversations;
CREATE TRIGGER trg_prevent_same_gender_conversation
BEFORE INSERT OR UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.check_conversation_gender_constraint();

-- ==============================================================================
-- TEST QUERIES DEMONSTRATING OPPOSITE-GENDER ENFORCEMENT
-- ==============================================================================

/*
-- Test Query 1: Prove male user receives ONLY female profiles
-- Logged in as Male User (auth.uid() = '00000000-0000-0000-0000-000000000001')
SELECT * FROM discover_profiles();

-- Test Query 2: Prove female user receives ONLY male profiles
-- Logged in as Female User (auth.uid() = '00000000-0000-0000-0000-000000000002')
SELECT * FROM discover_profiles();

-- Test Query 3: Attempting to insert a same-gender like (Should Fail with Exception)
INSERT INTO connection_requests (sender_id, receiver_id, status)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'pending');
*/
