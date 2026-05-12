-- Forever Scroll (一生的卷轴): support marking a pet as "left" and entering Memorial mode
-- Added 2026-05-13. Idempotent.

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS passed_away_at date,
  ADD COLUMN IF NOT EXISTS memorial_note text;

COMMENT ON COLUMN public.pets.passed_away_at IS '宠物离开的日期。NULL 表示尚未标记，非 NULL 进入纪念馆模式';
COMMENT ON COLUMN public.pets.memorial_note IS '可选的一句话纪念语，例如 "一只在阳光里长大的橘猫"';
