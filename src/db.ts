// Data layer. With Clerk auth, RLS reads auth.jwt()->>'sub'. The Supabase
// client used here must be the Clerk-token-injecting one (see supabase.ts).
// `owner` defaults to the Clerk sub server-side, so inserts carry no owner.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface DbConcept {
  id: string
  name: string
  prompt: string // stored in the `description` column
}

// The interface-lens concepts seeded on a user's first visit (the DB signup
// trigger is gone now that Clerk owns identity).
const SEED: { name: string; description: string }[] = [
  {
    name: 'Why do we need a backend at all?',
    description:
      'Explain, from first principles, why a backend exists. Why not run everything in the browser?',
  },
  {
    name: 'What is an interface, really?',
    description:
      'Explain what an interface is underneath the word — and what an API actually is.',
  },
  {
    name: 'Frontend vs backend',
    description: 'Explain what a frontend is, what a backend is, and why we need both.',
  },
  {
    name: 'What happens when you open the ChatGPT app?',
    description:
      'Walk through what goes on behind the scenes from the moment you open the app.',
  },
  {
    name: 'Why do we need a database?',
    description:
      'From first principles: what are the different ways to store data, and why do we need a database?',
  },
  {
    name: 'Choosing a storage option',
    description:
      'How do you choose one storage option over another? Which factors decide it?',
  },
]

// Load the user's concepts; seed them on first visit if none exist.
export async function loadConcepts(db: SupabaseClient): Promise<DbConcept[]> {
  const { data, error } = await db
    .from('concepts')
    .select('id, name, description')
    .order('created_at', { ascending: true })
  if (error) throw error

  if ((data ?? []).length === 0) {
    const { error: seedErr } = await db.from('concepts').insert(SEED)
    if (seedErr) throw seedErr
    const { data: seeded, error: reErr } = await db
      .from('concepts')
      .select('id, name, description')
      .order('created_at', { ascending: true })
    if (reErr) throw reErr
    return mapConcepts(seeded)
  }
  return mapConcepts(data)
}

function mapConcepts(rows: { id: string; name: string; description: string | null }[] | null) {
  return (rows ?? []).map((c) => ({ id: c.id, name: c.name, prompt: c.description ?? '' }))
}

export async function createSession(
  db: SupabaseClient,
  conceptId: string,
  personLabel: string,
  userKind: 'cold' | 'coached',
): Promise<string> {
  const { data, error } = await db
    .from('sessions')
    .insert({ concept_id: conceptId, person_label: personLabel, user_kind: userKind })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export interface SaveDerivation {
  sessionId: string
  explanation: string
  gapSentence: string | null
  followupQuestion: string
  retryAnswer: string
  closed: boolean | null
}

export async function saveDerivation(
  db: SupabaseClient,
  d: SaveDerivation,
): Promise<void> {
  const { error } = await db.from('derivations').insert({
    session_id: d.sessionId,
    explanation: d.explanation,
    gap_sentence: d.gapSentence,
    followup_question: d.followupQuestion,
    retry_answer: d.retryAnswer,
    close_result:
      d.closed === null ? 'unjudged' : d.closed ? 'closed' : 'not_closed',
    judged_by_human: d.closed !== null,
  })
  if (error) throw error
}
