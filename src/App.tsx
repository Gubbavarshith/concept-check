import { useEffect, useState } from 'react'
import { diagnose, type Diagnosis } from './diagnose'
import { useAuth } from './auth'
import Login from './Login'
import {
  loadConcepts,
  createSession,
  saveDerivation,
  type DbConcept,
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

export default function App() {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="page narrow">
        <p className="sub">Loading…</p>
      </div>
    )
  }
  if (!session) return <Login />
  return <Tool email={session.user.email ?? ''} onSignOut={signOut} />
}

function Tool({
  email,
  onSignOut,
}: {
  email: string
  onSignOut: () => void
}) {
  const [stage, setStage] = useState<Stage>('setup')

  // session setup
  const [person, setPerson] = useState('')
  const [userKind, setUserKind] = useState<'cold' | 'coached'>('cold')
  const [sessionId, setSessionId] = useState<string | null>(null)

  // concepts from the DB (seeded per-user on signup)
  const [concepts, setConcepts] = useState<DbConcept[]>([])
  const [conceptsError, setConceptsError] = useState<string | null>(null)

  const [concept, setConcept] = useState<DbConcept | null>(null)
  const [explanation, setExplanation] = useState('')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [retry, setRetry] = useState('')
  const [closed, setClosed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadConcepts()
      .then(setConcepts)
      .catch((e) => setConceptsError(String(e)))
  }, [])

  function choose(c: DbConcept) {
    setConcept(c)
    setStage('derive')
  }

  async function findGap() {
    if (!concept || explanation.trim().length < 12 || busy) return
    setBusy(true)
    const d = await diagnose(
      { id: concept.id, name: concept.name, prompt: concept.prompt },
      explanation,
    )
    setBusy(false)
    setDiagnosis(d)
    setStage(d.gapSentence === null ? 'done' : 'gap')
  }

  // When the human judges, persist the whole derivation.
  async function judge(value: boolean) {
    setClosed(value)
    if (!concept || !diagnosis) return
    setBusy(true)
    setSaveError(null)
    try {
      let sid = sessionId
      if (!sid) {
        sid = await createSession(concept.id, person.trim(), userKind)
        setSessionId(sid)
      }
      await saveDerivation({
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
  }

  return (
    <div className="page">
      <header className="head">
        <div className="topbar">
          <span className="who">{email}</span>
          <button className="link" onClick={onSignOut}>
            sign out
          </button>
        </div>
        <h1>Do you actually understand it — or just know the words?</h1>
        <p className="sub">
          Pick a concept and explain it in your own words, from scratch. This
          tool finds the one spot where your explanation stops being yours and
          turns into a memorized phrase — then asks the question that exposes it.
        </p>
      </header>

      {stage === 'setup' && (
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

      {stage === 'pick' && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">Choose a concept to derive</span>
            <span className="count">{person}</span>
          </div>
          {conceptsError && <div className="form-error">{conceptsError}</div>}
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

      {stage === 'derive' && concept && (
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
            onChange={(e) => setExplanation(e.target.value)}
          />
          <div className="row">
            <span className="hint-line">
              Write it the way you'd explain it to a friend. No right phrasing —
              just your real reasoning.
            </span>
            <button
              className="btn"
              onClick={findGap}
              disabled={busy || explanation.trim().length < 12}
            >
              {busy ? 'Reading…' : 'Find the gap →'}
            </button>
          </div>
        </main>
      )}

      {stage === 'gap' && concept && diagnosis && (
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

      {stage === 'retry' && concept && diagnosis && (
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

      {stage === 'done' && concept && diagnosis && (
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
        Gap found by: {diagnosis.source === 'model' ? 'the model' : 'local fallback (set the Anthropic key for the real diagnosis)'}.
        {' '}Concept: {concept.name}.
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
