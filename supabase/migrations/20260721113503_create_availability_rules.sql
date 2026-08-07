-- Migration: Availability Rules and Bookings
-- Scalable availability generation rather than free-form slots.

-------------------------------------------------------------------------------
-- 1. AVAILABILITY RULES (The Schedule)
-------------------------------------------------------------------------------
CREATE TABLE public.availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  -- 0 = Sunday, 1 = Monday, etc.
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;

-- RLS: Mentors can manage their own rules
CREATE POLICY "Users can manage own availability rules"
  ON public.availability_rules
  USING (EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = availability_rules.mentor_id AND mp.user_id = auth.uid()
  ));

-- RLS: Public can read availability rules of approved mentors
CREATE POLICY "Public can view availability rules"
  ON public.availability_rules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = availability_rules.mentor_id AND mp.status = 'approved'
  ));

-------------------------------------------------------------------------------
-- 2. GENERATED SLOTS (Materialized view of available times)
-------------------------------------------------------------------------------
-- Slots are generated via an Edge Function Cron Job based on rules.
CREATE TABLE public.generated_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time),
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, start_time)
);

ALTER TABLE public.generated_slots ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_slots_mentor_time ON public.generated_slots(mentor_id, start_time);

-- RLS: Public can view available slots
CREATE POLICY "Public can view generated slots"
  ON public.generated_slots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = generated_slots.mentor_id AND mp.status = 'approved'
  ));

-- RLS: Only Service Role can insert/update generated slots (via Edge Function)
-- No explicit INSERT/UPDATE policies for authenticated users.

-------------------------------------------------------------------------------
-- 3. BOOKINGS (Transactions)
-------------------------------------------------------------------------------
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES public.generated_slots(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS: Students can view their own bookings
CREATE POLICY "Students can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = student_id);

-- RLS: Mentors can view bookings attached to their slots
CREATE POLICY "Mentors can view own bookings"
  ON public.bookings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.generated_slots gs
    JOIN public.mentor_profiles mp ON mp.id = gs.mentor_id
    WHERE gs.id = bookings.slot_id AND mp.user_id = auth.uid()
  ));

-- RLS: Insert/Update is managed by Edge Function Service Layer to ensure transactional atomic slot claiming.
-- (No direct insert policy for users).

-- Triggers for updated_at
CREATE TRIGGER update_bookings_modtime
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
