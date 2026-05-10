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
  created_at: string
  updated_at: string
}

export type Species = 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'fish' | 'other'

export type Pet = {
  id: string
  owner_id: string
  name: string
  species: Species
  avatar_url: string | null
  birth_date: string | null
  note: string | null
  created_at: string
  updated_at: string
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
