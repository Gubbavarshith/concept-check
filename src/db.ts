// Data layer: read the user's seeded concepts, create a session, and save a
// derivation (with the human's gap-closed verdict). RLS guarantees a user only
// ever touches their own rows — these queries carry no owner filter because the
// policies enforce it server-side.

import { supabase } from './supabase'

export interface DbConcept {
  id: string
  name: string
  prompt: string // stored in the `description` column
}

export async function loadConcepts(): Promise<DbConcept[]> {
  const { data, error } = await supabase
    .from('concepts')
    .select('id, name, description')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    prompt: c.description ?? '',
  }))
}

export async function createSession(
  conceptId: string,
  personLabel: string,
  userKind: 'cold' | 'coached',
): Promise<string> {
  const { data, error } = await supabase
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

export async function saveDerivation(d: SaveDerivation): Promise<void> {
  const { error } = await supabase.from('derivations').insert({
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
