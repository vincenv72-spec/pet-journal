-- Pet POV v2 性格池二次扩展 —— 再加 4 种（凑齐 12 种）：
--   elder 老干部 / narcissist 自恋 / chuuni 中二 / philosopher 哲学家

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_pov_styles_check;

ALTER TABLE pets ADD CONSTRAINT pets_pov_styles_check CHECK (
  pov_styles IS NULL OR (
    array_length(pov_styles, 1) BETWEEN 1 AND 3
    AND pov_styles <@ ARRAY[
      'silly','literary','cute','grumpy','cool',
      'foodie','lazy','drama',
      'elder','narcissist','chuuni','philosopher'
    ]
  )
);
