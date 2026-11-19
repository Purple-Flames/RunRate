-- Add a distinct target income without rewriting existing income values.
-- Existing profiles keep their current income; users enter a target explicitly.
alter table public.profiles
  add column if not exists target_monthly_income numeric;
