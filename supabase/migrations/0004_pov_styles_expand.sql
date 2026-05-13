-- Pet POV v2 性格池扩展 —— 在原 5 种（silly/literary/cute/grumpy/cool）基础上新增 3 种：
--   foodie 吃货 / lazy 困倦 / drama 戏精
--
-- 仅放宽 pets_pov_styles_check 约束的允许集合，不动现有数据。

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_pov_styles_check;

ALTER TABLE pets ADD CONSTRAINT pets_pov_styles_check CHECK (
  pov_styles IS NULL OR (
    array_length(pov_styles, 1) BETWEEN 1 AND 3
    AND pov_styles <@ ARRAY['silly','literary','cute','grumpy','cool','foodie','lazy','drama']
  )
);
