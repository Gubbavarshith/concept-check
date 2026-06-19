import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/react'
import { useMemo } from 'react'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill them in.',
  )
}

// A Supabase client bound to the current Clerk session: every request carries
// the Clerk token, so RLS policies that read auth.jwt()->>'sub' match the
// signed-in user. (Clerk is registered as a third-party auth provider in
// Supabase, so Supabase trusts these tokens.)
export function useSupabase(): SupabaseClient {
  const { session } = useSession()

  return useMemo(
    () =>
      createClient(url, key, {
        accessToken: async () => (await session?.getToken()) ?? null,
      }),
    [session],
  )
}
