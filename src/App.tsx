import { useState } from 'react'
import { CONCEPTS, type Concept } from './seed'
import { diagnose, type Diagnosis } from './diagnose'

// The flow, matching info2.md:
//   pick -> derive (free explanation) -> see the gap + follow-up
//   -> retry -> a HUMAN judges whether the gap closed -> result.
type Stage = 'pick' | 'derive' | 'gap' | 'retry' | 'done'

// What we hold for the whole session — the Move 5 before/after evidence.
interface Record {
  concept: Concept
  explanation: string // before
  diagnosis: Diagnosis // the gap + follow-up
  retry: string // after
  closed: boolean | null // the HUMAN's verdict (null until they decide)
}

export default function App() {
  const [stage, setStage] = useState<Stage>('pick')
  const [concept, setConcept] = useState<Concept | null>(null)
  const [explanation, setExplanation] = useState('')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [retry, setRetry] = useState('')
  const [closed, setClosed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  function choose(c: Concept) {
    setConcept(c)
    setStage('derive')
  }

  async function findGap() {
    if (!concept || explanation.trim().length < 12 || busy) return
    setBusy(true)
    const d = await diagnose(concept, explanation)
    setBusy(false)
    setDiagnosis(d)
    // No gap found = a clean derivation. Skip straight to the result.
    setStage(d.gapSentence === null ? 'done' : 'gap')
  }

  function reset() {
    setStage('pick')
    setConcept(null)
    setExplanation('')
    setDiagnosis(null)
    setRetry('')
    setClosed(null)
  }

  return (
    <div className="page">
      <header className="head">
        <h1>Do you actually understand it — or just know the words?</h1>
        <p className="sub">
          Pick a concept and explain it in your own words, from scratch. This
          tool finds the one spot where your explanation stops being yours and
          turns into a memorized phrase — then asks the question that exposes it.
        </p>
      </header>

      {stage === 'pick' && (
        <main className="card">
          <div className="trail">
            <span className="concept-tag">Choose a concept to derive</span>
          </div>
          <ul className="concept-list">
            {CONCEPTS.map((c) => (
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
          onJudge={setClosed}
          onReset={reset}
        />
      )}
    </div>
  )
}

function Result({
  record,
  onJudge,
  onReset,
}: {
  record: Record
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
          The explanation held up from first principles, with no point where it
          collapsed into a memorized phrase. For the hypothesis, that's a clean
          “could already derive it.”
        </p>
      ) : (
        <>
          <Block label="Before — first explanation" body={explanation} />
          <div className="gap-box compact">
            <span className="gap-label">The gap that was named</span>
            <p className="gap-sentence">“{diagnosis.gapSentence}”</p>
          </div>
          <Block label="After — once the gap was named" body={retry} />

          {/* MOVE 3: the human — not the model — judges if the gap closed. */}
          <div className="judge-box">
            <span className="hint-label">
              Did they actually close the gap? (your call — not the model's)
            </span>
            <div className="judge-buttons">
              <button
                className={`judge-btn yes ${closed === true ? 'on' : ''}`}
                onClick={() => onJudge(true)}
              >
                Yes — they derived it
              </button>
              <button
                className={`judge-btn no ${closed === false ? 'on' : ''}`}
                onClick={() => onJudge(false)}
              >
                No — still stuck
              </button>
            </div>
            {closed !== null && (
              <p className="judge-verdict">
                {closed
                  ? 'Recorded as a genuine shift: couldn’t derive → could.'
                  : 'Recorded as not closed — the gap stayed open.'}
              </p>
            )}
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
