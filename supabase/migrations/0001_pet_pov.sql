-- Pet POV (Point of View): AI-generated pet-perspective rewrites of user diary entries
-- Added 2026-05-13. Idempotent.

ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS pet_pov_text text,
  ADD COLUMN IF NOT EXISTS pet_pov_style text,
  ADD COLUMN IF NOT EXISTS pet_pov_generated_at timestamptz;

COMMENT ON COLUMN public.entries.pet_pov_text IS 'AI-generated diary content from pet POV (DeepSeek)';
COMMENT ON COLUMN public.entries.pet_pov_style IS 'One of: silly | literary | cute | grumpy | cool';
COMMENT ON COLUMN public.entries.pet_pov_generated_at IS 'When the POV was last generated';
