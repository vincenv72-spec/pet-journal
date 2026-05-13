import { createClient } from '@supabase/supabase-js'

// Supabase publishable key 设计上就是公开的（配合数据库 RLS 使用），
// 所以可以放在前端代码里。如果想换 URL/key，可以用环境变量覆盖。
const url = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://iwincsvrmjiszzeuhnfe.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_dDQkRknwD8gz-ZvIYWTURA_9PI0mt1E'

export const supabase = createClient(url, key)

// entries.pet_pov_style 比 Pet.pov_styles 多一个 'fused' 值 —— 多性格融合时写入
export type EntryPovStyle = PetPovStyle | 'fused'

export type Entry = {
  id: string
  user_id: string
  title: string
  content: string
  mood: string | null
  pet_name: string | null
  pet_id: string | null
  entry_date: string
  photo_url: string | null
  tags: string[]
  pet_pov_text: string | null
  pet_pov_style: EntryPovStyle | null
  pet_pov_generated_at: string | null
  created_at: string
  updated_at: string
}

export const PET_POV_STYLES = [
  { id: 'silly',    label: '傻乎乎', emoji: '🌿', description: '天真烂漫，对什么都好奇惊叹' },
  { id: 'literary', label: '文艺',   emoji: '🌙', description: '安静细腻，观察光与气味' },
  { id: 'cute',     label: '撒娇',   emoji: '🍯', description: '软糯黏人，叠词多多' },
  { id: 'grumpy',   label: '暴躁',   emoji: '🌪', description: '吐槽担当，嫌弃但温柔' },
  { id: 'cool',     label: '高冷',   emoji: '🌌', description: '克制简洁，看似不在乎' },
] as const

export type PetPovStyle = typeof PET_POV_STYLES[number]['id']

// 标签预设（用户也能自由输入）
export const TAG_PRESETS = [
  { value: '日常', emoji: '🌿' },
  { value: '吃喝', emoji: '🍖' },
  { value: '运动', emoji: '🎾' },
  { value: '出游', emoji: '🌳' },
  { value: '就医', emoji: '🏥' },
  { value: '美容', emoji: '✂️' },
  { value: '睡相', emoji: '😴' },
  { value: '犯傻', emoji: '🤪' },
  { value: '撒娇', emoji: '🥰' },
  { value: '学习', emoji: '🎓' },
  { value: '节日', emoji: '🎉' },
  { value: '生日', emoji: '🎂' },
] as const

export type Species = 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'fish' | 'other'

export type Pet = {
  id: string
  owner_id: string
  name: string
  species: Species
  breed: string | null
  avatar_url: string | null
  birth_date: string | null
  note: string | null
  passed_away_at: string | null
  memorial_note: string | null
  pov_styles: PetPovStyle[] | null
  created_at: string
  updated_at: string
}

// POV fallback 文案（DeepSeek 失败时静默写入，统一撒娇语气）
export const POV_FALLBACK_TEXT = '主人主人～我刚刚走神了一下下，等等再问我啦'

export function getPovStyleMeta(
  style: EntryPovStyle | null | undefined
): { emoji: string; label: string } | null {
  if (!style) return null
  if (style === 'fused') return { emoji: '✨', label: '混合' }
  const found = PET_POV_STYLES.find((s) => s.id === style)
  return found ? { emoji: found.emoji, label: found.label } : null
}

export function isMemorial(pet: Pet | null | undefined): boolean {
  return !!pet?.passed_away_at
}

export function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e)) return null
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)))
}

// 常见品种快选（其他物种保持自由输入）
export const BREED_PRESETS: Partial<Record<Species, string[]>> = {
  cat: ['田园猫', '橘猫', '狸花', '英短', '美短', '布偶', '暹罗', '折耳', '加菲', '缅因', '阿比', '无毛'],
  dog: ['田园犬', '金毛', '拉布拉多', '柴犬', '边牧', '哈士奇', '萨摩耶', '比熊', '泰迪', '法斗', '柯基', '博美'],
}

export const SPECIES_LABEL: Record<Species, string> = {
  cat: '🐱 猫',
  dog: '🐶 狗',
  rabbit: '🐰 兔',
  bird: '🐦 鸟',
  hamster: '🐹 仓鼠',
  fish: '🐟 鱼',
  other: '🐾 其他',
}

export const SPECIES_CN: Record<Species, string> = {
  cat: '猫',
  dog: '狗',
  rabbit: '兔子',
  bird: '鸟',
  hamster: '仓鼠',
  fish: '鱼',
  other: '小动物',
}

export const SPECIES_EMOJI: Record<Species, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🐦',
  hamster: '🐹',
  fish: '🐟',
  other: '🐾',
}
