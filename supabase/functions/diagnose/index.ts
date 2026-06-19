// Concept Check — server-side DIAGNOSER (info2.md shape).
//
// Runs on Supabase Edge (Deno), NOT in the browser, so the Anthropic API key
// (ANTHROPIC_API_KEY secret) never reaches the client.
//
// MOVE 3 BOUNDARY (decided on purpose):
//   PROBABILISTIC (this function / the model): find the single sentence where
//   the explanation became a memorized label, and write ONE follow-up that
//   exposes it.
//   DETERMINISTIC / HUMAN (NOT this function): whether the learner's retry
//   actually closed the gap. We deliberately DO NOT let the model judge the
//   second derivation — a soft judge tells everyone they passed, which would
//   sink the whole claim. A human marks close/not_closed in the app.
//
// One action only:
//   action: "diagnose" -> { gap_sentence, followup_question }
// If the explanation shows a genuine first-principles derivation with no gap,
// the model returns gap_sentence: null.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-opus-4-8'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Body {
  concept: string
  prompt: string // the derivation prompt the learner was answering
  explanation: string // the learner's free-form derivation
}

const SYSTEM =
  'You are a strict examiner of conceptual understanding. A learner has tried ' +
  'to derive a concept from first principles in their own words. Find the ' +
  'SINGLE sentence (or phrase) where their explanation stops being genuine ' +
  'reasoning and becomes a memorized label they are repeating without ' +
  'understanding — the exact moment the thinking stopped. Then write ONE sharp ' +
  'follow-up question that exposes that gap by forcing them to reason past the ' +
  'memorized phrase. Do NOT reveal the answer in the question. If the ' +
  'explanation is a genuine first-principles derivation with no such gap, set ' +
  'gap_sentence to null. Reply with JSON only, no other text.'

function userBlock(b: Body): string {
  return (
    `<concept>${b.concept}</concept>\n` +
    `<derivation_prompt>${b.prompt}</derivation_prompt>\n` +
    `<learner_explanation>${b.explanation}</learner_explanation>`
  )
}

async function callAnthropic(user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Anthropic ${res.status}: ${detail}`)
  }
  const data = await res.json()
  return data?.content?.[0]?.text ?? ''
}

function parseJson(text: string): Record<string, unknown> {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error(`No JSON in reply: ${text}`)
  return JSON.parse(text.slice(start, end + 1))
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY secret is not set.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const body = (await req.json()) as Body
    const user =
      userBlock(body) +
      '\n\nRespond ONLY as: ' +
      '{"gap_sentence":"<the exact sentence where it became a label, or null>",' +
      '"followup_question":"<one question that exposes the gap>"}'

    const raw = await callAnthropic(user)
    const parsed = parseJson(raw)

    return new Response(JSON.stringify(parsed), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }
})
