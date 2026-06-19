// Diagnoser client. Calls the `diagnose` Supabase Edge Function (which calls
// Anthropic server-side). If that's unavailable — no session, or the
// ANTHROPIC_API_KEY secret isn't set yet — it falls back to a local heuristic
// so the whole flow is demoable before the key arrives.
//
// IMPORTANT (Move 3): this only does the PROBABILISTIC half — find the gap,
// write the follow-up. It NEVER judges whether the retry closed the gap. That
// is a human decision, made in the UI.

import { supabase } from './supabase'
import type { Concept } from './seed'

export interface Diagnosis {
  gapSentence: string | null
  followupQuestion: string
  source: 'model' | 'local'
}

export async function diagnose(
  concept: Concept,
  explanation: string,
): Promise<Diagnosis> {
  // Try the real server-side diagnoser first.
  try {
    const { data, error } = await supabase.functions.invoke('diagnose', {
      body: {
        concept: concept.name,
        prompt: concept.prompt,
        explanation,
      },
    })
    if (!error && data && !data.error && data.followup_question) {
      return {
        gapSentence: data.gap_sentence ?? null,
        followupQuestion: data.followup_question,
        source: 'model',
      }
    }
  } catch {
    // fall through to local
  }
  return localDiagnose(concept, explanation)
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
