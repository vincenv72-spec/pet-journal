-- Forever Scroll Stage 2 之后 —— Pet POV v2：性格归属从 entry 改为 pet（多选 1-3 个）
--
-- 背景：上线第一版 POV 是"主人写手帐时手动选 1 种性格 → 生成"工具感强。
-- 新版改成：宠物添加时主人选 1-3 种性格 → 主人保存手帐后系统自动从中随机抽用 1 种调 DeepSeek 生成 POV。
-- entries.pet_pov_style 字段保留（向后兼容已有 entries 数据），但前端不再使用编辑入口。

-- 1. pets 加 pov_styles text[] 字段
ALTER TABLE pets ADD COLUMN pov_styles text[];

ALTER TABLE pets ADD CONSTRAINT pets_pov_styles_check CHECK (
  pov_styles IS NULL OR (
    array_length(pov_styles, 1) BETWEEN 1 AND 3
    AND pov_styles <@ ARRAY['silly','literary','cute','grumpy','cool']
  )
);

COMMENT ON COLUMN pets.pov_styles IS 'Pet 的 POV 性格池（1-3 个），每篇手帐保存时从中随机抽用';

-- 2. 反推 —— 已有 entries 用过的 pet_pov_style 频次 top 3 → 写入对应 pet 的 pov_styles
WITH pet_style_counts AS (
  SELECT
    pet_id,
    pet_pov_style,
    COUNT(*) as cnt
  FROM entries
  WHERE pet_id IS NOT NULL AND pet_pov_style IS NOT NULL
  GROUP BY pet_id, pet_pov_style
),
ranked AS (
  SELECT
    pet_id,
    pet_pov_style,
    ROW_NUMBER() OVER (PARTITION BY pet_id ORDER BY cnt DESC) as rk
  FROM pet_style_counts
)
UPDATE pets p
SET pov_styles = sub.styles
FROM (
  SELECT pet_id, array_agg(pet_pov_style ORDER BY rk) as styles
  FROM ranked
  WHERE rk <= 3
  GROUP BY pet_id
) sub
WHERE p.id = sub.pet_id;
