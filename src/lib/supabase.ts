import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)

export type Entry = {
  id: string
  user_id: string
  title: string
  content: string
  mood: string | null
  pet_name: string | null
  entry_date: string
  photo_url: string | null
  created_at: string
  updated_at: string
}
