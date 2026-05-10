import { createClient } from '@supabase/supabase-js'

// Supabase publishable key 设计上就是公开的（配合数据库 RLS 使用），
// 所以可以放在前端代码里。如果想换 URL/key，可以用环境变量覆盖。
const url = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://iwincsvrmjiszzeuhnfe.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_dDQkRknwD8gz-ZvIYWTURA_9PI0mt1E'

export const supabase = createClient(url, key)

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
  created_at: string
  updated_at: string
}

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
  created_at: string
  updated_at: string
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

export const SPECIES_EMOJI: Record<Species, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🐦',
  hamster: '🐹',
  fish: '🐟',
  other: '🐾',
}
