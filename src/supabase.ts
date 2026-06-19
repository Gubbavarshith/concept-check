import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill them in.',
  )
}

export const supabase = createClient(url, key)
