// Diagnoser client. Calls the `diagnose` Supabase Edge Function (which calls
// Anthropic server-side). If that's unavailable — no session, or the
// ANTHROPIC_API_KEY secret isn't set yet — it falls back to a local heuristic
// so the whole flow is demoable before the key arrives.
//
// IMPORTANT (Move 3): this only does the PROBABILISTIC half — find the gap,
// write the follow-up. It NEVER judges whether the retry closed the gap. That
// is a human decision, made in the UI.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Concept } from './seed'

export interface Diagnosis {
  gapSentence: string | null
  followupQuestion: string
  source: 'model' | 'local'
  // When the model path failed and we fell back, this holds the reason so we
  // can surface it instead of guessing.
  fallbackReason?: string
}

// Advisory evaluation of the retry. NON-BINDING — it equips the human judge
// with criteria + a suggested read; the human still clicks the final verdict.
export interface Evaluation {
  criteria: string[] // what a correct answer must explain
  suggestion: 'closed' | 'partly' | 'not_closed' | null
  reason: string
}

export async function diagnose(
  db: SupabaseClient,
  concept: Concept,
  explanation: string,
  // The Clerk session token, passed explicitly in the Authorization header.
  token?: string | null,
): Promise<Diagnosis> {
  let fallbackReason = 'the model call did not return a usable answer'
  // Try the real server-side diagnoser first.
  try {
    const { data, error } = await db.functions.invoke('diagnose', {
      body: {
        concept: concept.name,
        prompt: concept.prompt,
        explanation,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (error) {
      // Supabase wraps non-2xx responses in a FunctionsHttpError; pull the
      // status/body so we know exactly why (401 gateway, 500 OpenAI, etc.).
      let detail = error.message ?? String(error)
      try {
        const ctx = (error as { context?: Response }).context
        if (ctx && typeof ctx.text === 'function') {
          const body = await ctx.text()
          detail = `${ctx.status} ${body}`.slice(0, 300)
        }
      } catch {
        /* ignore */
      }
      fallbackReason = detail
    } else if (data?.error) {
      fallbackReason = String(data.error)
    } else if (data?.followup_question) {
      return {
        gapSentence: data.gap_sentence ?? null,
        followupQuestion: data.followup_question,
        source: 'model',
      }
    }
  } catch (e) {
    fallbackReason = String(e)
  }
  return { ...localDiagnose(concept, explanation), fallbackReason }
}

// Advisory evaluation of the retry — criteria + a non-binding suggested read.
// The human still makes the final call in the UI. Returns null if the model is
// unavailable (we simply don't show a suggestion in that case).
export async function evaluate(
  db: SupabaseClient,
  concept: Concept,
  gapSentence: string | null,
  followupQuestion: string,
  retryAnswer: string,
  token?: string | null,
): Promise<Evaluation | null> {
  try {
    const { data, error } = await db.functions.invoke('diagnose', {
      body: {
        action: 'evaluate',
        concept: concept.name,
        prompt: concept.prompt,
        gapSentence,
        followupQuestion,
        retryAnswer,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (error || !data || data.error || !Array.isArray(data.criteria)) return null
    const s = data.suggestion
    return {
      criteria: data.criteria.filter((c: unknown) => typeof c === 'string'),
      suggestion:
        s === 'closed' || s === 'partly' || s === 'not_closed' ? s : null,
      reason: typeof data.reason === 'string' ? data.reason : '',
    }
  } catch {
    return null
  }
}

// ---- Local fallback (heuristic, demo-only) -------------------------------
// Picks the sentence most loaded with memorized-sounding buzzwords as the gap,
// and offers a concept-specific follow-up. Crude on purpose — the real signal
// comes from the model once the key is set.

const BUZZWORDS = [
  'interface', 'api', 'endpoint', 'server', 'client', 'protocol', 'request',
  'response', 'database', 'store', 'data', 'http', 'json', 'rest', 'backend',
  'frontend', 'security', 'scalable', 'cloud', 'service', 'handles', 'manages',
  'communicate', 'abstraction', 'layer',
  // memorized "comfort phrases" we saw people hide behind in real sessions —
  // reached for when they can't derive (e.g. "it's encrypted", "salt").
  'encrypted', 'encryption', 'hash', 'hashed', 'hashing', 'salt', 'decrypt',
  'business logic', 'secure', 'packets',
]

const FOLLOWUPS: Record<string, string> = {
  backend:
    'If browsers can run code and talk to each other, what exactly is the one job a backend does that the browser fundamentally cannot?',
  interface:
    'You used the word "API" — describe one without using the words interface, endpoint, or request.',
  'front-back':
    'If you put all the backend logic into the frontend, name the first concrete thing that breaks.',
  chatgpt:
    'Between your keystroke and the reply appearing, name the one step where the work could NOT happen on your own device, and why.',
  database:
    'A plain file can store data too. Name the one thing a database does that a file genuinely cannot.',
  'storage-choice':
    'Give me a real situation where the "obvious" storage choice is the wrong one, and say why.',
}

function localDiagnose(concept: Concept, explanation: string): Diagnosis {
  const sentences = explanation
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  let gap: string | null = null
  let worst = -1
  for (const s of sentences) {
    const lower = s.toLowerCase()
    const score = BUZZWORDS.reduce(
      (n, w) => (lower.includes(w) ? n + 1 : n),
      0,
    )
    if (score > worst) {
      worst = score
      gap = s
    }
  }
  // If nothing buzzword-y and the answer is substantial, treat as no gap.
  if (worst <= 1 && explanation.length > 220) gap = null

  return {
    gapSentence: gap,
    followupQuestion:
      FOLLOWUPS[concept.id] ??
      'Explain that last point again without using any of the technical words you just used.',
    source: 'local',
  }
}
