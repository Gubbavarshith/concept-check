import { useEffect, useState } from 'react'
import { useSession } from '@clerk/react'
import { diagnose, type Diagnosis } from './diagnose'
import { useSupabase } from './supabase'
import {
  loadConcepts,
  createSession,
  saveDerivation,
  loadPastAttempts,
  type DbConcept,
  type PastAttempt,
} from './db'

// The flow, matching info2.md:
//   setup (who's answering) -> pick -> derive -> see the gap + follow-up
//   -> retry -> a HUMAN judges whether the gap closed -> result (persisted).
type Stage = 'setup' | 'pick' | 'derive' | 'gap' | 'retry' | 'done'

interface Record {
  concept: DbConcept
  explanation: string // before
  diagnosis: Diagnosis // the gap + follow-up
  retry: string // after
  closed: boolean | null // the HUMAN's verdict
}

export default function Tool() {
  const supabase = useSupabase()
  const { session } = useSession()

  // Which view: run a new check, or browse stored past attempts.
  const [view, setView] = useState<'check' | 'history'>('check')

  const [stage, setStage] = useState<Stage>('setup')

  // session setup
  const [person, setPerson] = useState('')
  const [userKind, setUserKind] = useState<'cold' | 'coached'>('cold')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [concepts, setConcepts] = useState<DbConcept[]>([])
  const [conceptsError, setConceptsError] = useState<string | null>(null)

  const [concept, setConcept] = useState<DbConcept | null>(null)
  const [explanation, setExplanation] = useState('')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [retry, setRetry] = useState('')
  const [closed, setClosed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [inputNote, setInputNote] = useState<string | null>(null)

  useEffect(() => {
    loadConcepts(supabase)
      .then(setConcepts)
      .catch((e) => setConceptsError(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function choose(c: DbConcept) {
    setConcept(c)
    setStage('derive')
  }

  async function findGap() {
    if (!concept || busy) return
    // Input guard: don't diagnose a non-answer. Real sessions showed people
    // giving one-liners or just restating the prompt — that produces junk
    // evidence. Require a genuine attempt first.
    const note = inputProblem(explanation, concept.prompt)
    if (note) {
      setInputNote(note)
      return
    }
    setInputNote(null)
    setBusy(true)
    const token = (await session?.getToken()) ?? null
    const d = await diagnose(
      supabase,
      { id: concept.id, name: concept.name, prompt: concept.prompt },
      explanation,
      token,
    )
    setBusy(false)
    setDiagnosis(d)
    setStage(d.gapSentence === null ? 'done' : 'gap')
  }

  async function judge(value: boolean) {
    setClosed(value)
    if (!concept || !diagnosis) return
    setBusy(true)
    setSaveError(null)
    try {
      let sid = sessionId
      if (!sid) {
        sid = await createSession(supabase, concept.id, person.trim(), userKind)
        setSessionId(sid)
      }
      await saveDerivation(supabase, {
        sessionId: sid,
        explanation,
        gapSentence: diagnosis.gapSentence,
        followupQuestion: diagnosis.followupQuestion,
        retryAnswer: retry,
        closed: value,
      })
    } catch (e) {
      setSaveError(String(e))
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setStage('pick')
    setConcept(null)
    setExplanation('')
    setDiagnosis(null)
    setRetry('')
    setClosed(null)
    setSaveError(null)
    setInputNote(null)
  }

  return (
    <div className="page tool-ed">
      <header className="head">
        <span className="mono tool-eyebrow">[ the instrument ]</span>
        <h1>Do you actually understand it — or just know the words?</h1>
        <p className="sub">
          Pick a concept and explain it in your own words, from scratch. This
          tool finds the one spot where your explanation stops being yours and
          turns into a memorized phrase — then asks the question that exposes it.
        </p>
      </header>

      <div className="tool-tabs">
        <button
          className={`tool-tab ${view === 'check' ? 'on' : ''}`}
          onClick={() => setView('check')}
        >
          New check
        </button>
        <button
          className={`tool-tab ${view === 'history' ? 'on' : ''}`}
          onClick={() => setView('history')}
        >
          My past attempts
        </button>
      </div>

      {view === 'history' && <PastAttempts supabase={supabase} />}

      {view === 'check' && stage === 'setup' && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">Who's deriving this time?</span>
          </div>
          <label className="field">
            Name or label
            <input
              autoFocus
              value={person}
              placeholder="e.g. Alex"
              onChange={(e) => setPerson(e.target.value)}
            />
          </label>
          <div className="field">
            Did you coach them, or are they a cold user?
            <div className="judge-buttons" style={{ marginTop: 8 }}>
              <button
                className={`judge-btn ${userKind === 'cold' ? 'on yes' : ''}`}
                onClick={() => setUserKind('cold')}
              >
                Cold user (didn’t coach)
              </button>
              <button
                className={`judge-btn ${userKind === 'coached' ? 'on no' : ''}`}
                onClick={() => setUserKind('coached')}
              >
                I coached them
              </button>
            </div>
          </div>
          <div className="row end">
            <button
              className="btn"
              onClick={() => setStage('pick')}
              disabled={person.trim().length === 0}
            >
              Choose a concept →
            </button>
          </div>
        </main>
      )}

      {view === 'check' && stage === 'pick' && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">Choose a concept to derive</span>
            <span className="count">{person}</span>
          </div>
          {conceptsError && <div className="form-error">{conceptsError}</div>}
          {!conceptsError && concepts.length === 0 && (
            <p className="sub" style={{ marginTop: 0 }}>Loading concepts…</p>
          )}
          <ul className="concept-list">
            {concepts.map((c) => (
              <li key={c.id}>
                <button className="concept-btn" onClick={() => choose(c)}>
                  <span className="concept-name">{c.name}</span>
                  <span className="concept-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {view === 'check' && stage === 'derive' && concept && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">{concept.name}</span>
            <button className="link" onClick={reset}>
              change
            </button>
          </div>
          <h2 className="question">{concept.prompt}</h2>
          <textarea
            className="answer"
            autoFocus
            value={explanation}
            placeholder="Explain it in your own words — don't define it, derive it…"
            onChange={(e) => {
              setExplanation(e.target.value)
              if (inputNote) setInputNote(null)
            }}
          />
          {inputNote && <div className="form-error">{inputNote}</div>}
          <div className="row">
            <span className="hint-line">
              Write it the way you'd explain it to a friend. No right phrasing —
              just your real reasoning.
            </span>
            <button
              className="btn"
              onClick={findGap}
              disabled={busy || explanation.trim().length === 0}
            >
              {busy ? 'Reading…' : 'Find the gap →'}
            </button>
          </div>
        </main>
      )}

      {view === 'check' && stage === 'gap' && concept && diagnosis && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">{concept.name}</span>
            <span className="count">Here's the gap</span>
          </div>

          {diagnosis.gapSentence && (
            <div className="gap-box">
              <span className="gap-label">
                Where your explanation became a label
              </span>
              <p className="gap-sentence">“{diagnosis.gapSentence}”</p>
            </div>
          )}

          <div className="followup-box">
            <span className="hint-label">The question that exposes it</span>
            {diagnosis.followupQuestion}
          </div>

          <div className="row end">
            <button className="btn" onClick={() => setStage('retry')}>
              Try to close it →
            </button>
          </div>
        </main>
      )}

      {view === 'check' && stage === 'retry' && concept && diagnosis && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">{concept.name}</span>
          </div>
          <div className="followup-box">
            <span className="hint-label">The question</span>
            {diagnosis.followupQuestion}
          </div>
          <textarea
            className="answer"
            autoFocus
            value={retry}
            placeholder="Reason it out now — in your own words…"
            onChange={(e) => setRetry(e.target.value)}
          />
          <div className="row end">
            <button
              className="btn"
              onClick={() => setStage('done')}
              disabled={retry.trim().length < 8}
            >
              See the result →
            </button>
          </div>
        </main>
      )}

      {view === 'check' && stage === 'done' && concept && diagnosis && (
        <Result
          record={{ concept, explanation, diagnosis, retry, closed }}
          person={person}
          busy={busy}
          saveError={saveError}
          onJudge={judge}
          onReset={reset}
        />
      )}
    </div>
  )
}

// "My past attempts" — the stored gap→result records for the signed-in user.
// RLS guarantees these are only ever this user's own rows, which is exactly the
// persistence + isolation the project asks to demonstrate.
function PastAttempts({ supabase }: { supabase: ReturnType<typeof useSupabase> }) {
  const [items, setItems] = useState<PastAttempt[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPastAttempts(supabase)
      .then(setItems)
      .catch((e) => setError(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (items === null)
    return (
      <p className="sub" style={{ marginTop: 0 }}>
        Loading your attempts…
      </p>
    )

  if (items.length === 0)
    return (
      <main className="card">
        <div className="trail">
          <span className="concept-tag">Nothing stored yet</span>
        </div>
        <p className="sub" style={{ margin: 0 }}>
          Run a check and it’ll be saved here — your explanation, the gap that was
          named, your second try, and whether it closed.
        </p>
      </main>
    )

  return (
    <div className="attempts">
      <div className="attempts-count mono">
        {items.length} stored attempt{items.length === 1 ? '' : 's'} · only yours
      </div>
      {items.map((a) => (
        <article className="attempt card" key={a.id}>
          <div className="attempt-top">
            <span className="concept-tag">{a.conceptName}</span>
            <span className={`verdict-chip ${a.closeResult}`}>
              {a.closeResult === 'closed'
                ? 'gap closed'
                : a.closeResult === 'not_closed'
                  ? 'still open'
                  : 'unjudged'}
            </span>
          </div>

          <div className="attempt-meta mono">
            {a.personLabel} · {a.userKind} · {fmtDate(a.createdAt)}
            {a.judgedByHuman ? ' · judged by a human' : ''}
          </div>

          <Block label="Before — first explanation" body={a.explanation} />

          {a.gapSentence && (
            <div className="gap-box compact">
              <span className="gap-label">The gap that was named</span>
              <p className="gap-sentence">“{a.gapSentence}”</p>
            </div>
          )}

          {a.followupQuestion && (
            <div className="followup-box">
              <span className="hint-label">The exposing question</span>
              {a.followupQuestion}
            </div>
          )}

          {a.retryAnswer && (
            <Block label="After — second try" body={a.retryAnswer} />
          )}
        </article>
      ))}
    </div>
  )
}

// Returns a reason the explanation isn't a real attempt yet, or null if it's
// good to diagnose. Catches: too short, too few words, or just parroting the
// prompt back. Keeps the stored evidence honest.
function inputProblem(explanation: string, prompt: string): string | null {
  const text = explanation.trim()
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 15)
    return 'Give it a real go first — explain it in a few full sentences, the way you’d tell a friend.'

  // Restating the prompt instead of answering it.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  if (norm(text) === norm(prompt) || norm(text).startsWith(norm(prompt)))
    return 'That’s the question again — try explaining the answer in your own words instead.'

  return null
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function Result({
  record,
  person,
  busy,
  saveError,
  onJudge,
  onReset,
}: {
  record: Record
  person: string
  busy: boolean
  saveError: string | null
  onJudge: (v: boolean) => void
  onReset: () => void
}) {
  const { concept, explanation, diagnosis, retry, closed } = record
  const noGap = diagnosis.gapSentence === null

  return (
    <main className="card">
      <h2 className="question">
        {noGap ? 'No gap found — that was a real derivation.' : 'The before and after'}
      </h2>

      {noGap ? (
        <p className="sub" style={{ marginTop: 0 }}>
          {person}’s explanation held up from first principles, with no point
          where it collapsed into a memorized phrase. For the hypothesis, that's
          a clean “could already derive it.”
        </p>
      ) : (
        <>
          <Block label={`Before — ${person}'s first explanation`} body={explanation} />
          <div className="gap-box compact">
            <span className="gap-label">The gap that was named</span>
            <p className="gap-sentence">“{diagnosis.gapSentence}”</p>
          </div>
          <Block label="After — once the gap was named" body={retry} />

          {/* MOVE 3: the human — not the model — judges if the gap closed. */}
          <div className="judge-box">
            <span className="hint-label">
              Did {person} actually close the gap? (your call — not the model's)
            </span>
            <p className="judge-guide">
              Only say yes if they <strong>reasoned it out in their own words</strong>{' '}
              this time — not if they just reworded the same phrase, agreed, or
              said “oh right.” Be strict: a generous yes makes the result useless.
            </p>
            <div className="judge-buttons">
              <button
                className={`judge-btn yes ${closed === true ? 'on' : ''}`}
                onClick={() => onJudge(true)}
                disabled={busy}
              >
                Yes — they derived it
              </button>
              <button
                className={`judge-btn no ${closed === false ? 'on' : ''}`}
                onClick={() => onJudge(false)}
                disabled={busy}
              >
                No — still stuck
              </button>
            </div>
            {closed !== null && !saveError && (
              <p className="judge-verdict">
                {closed
                  ? 'Recorded as a genuine shift: couldn’t derive → could.'
                  : 'Recorded as not closed — the gap stayed open.'}
                {busy ? ' Saving…' : ' Saved.'}
              </p>
            )}
            {saveError && <div className="form-error">{saveError}</div>}
          </div>
        </>
      )}

      <div className="footnote">
        Gap found by: {diagnosis.source === 'model' ? 'the model' : 'local fallback'}.
        {' '}Concept: {concept.name}.
        {diagnosis.source === 'local' && diagnosis.fallbackReason && (
          <>
            {' '}
            <br />
            <span style={{ color: 'var(--paper-red)' }}>
              Model unavailable — {diagnosis.fallbackReason}
            </span>
          </>
        )}
      </div>

      <button className="btn ghost" onClick={onReset}>
        Run another
      </button>
    </main>
  )
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="block">
      <span className="block-label">{label}</span>
      <p className="block-body">{body}</p>
    </div>
  )
}
