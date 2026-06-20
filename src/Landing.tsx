import { Show, SignInButton } from '@clerk/react'
import { motion } from 'framer-motion'
import { useReveal } from './useReveal'

// Editorial / asymmetric-split landing. No centered hero, no cards, no blobs.
// A hard structural grid, oversized left-aligned type, monospace labels,
// outsized index numbers, and an off-grid right column holding the live
// "broken sentence" artifact.
export function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <main className="ed">
      <EdHero onLaunch={onLaunch} />
      <EdThesis />
      <EdProcess />
      <EdMoves />
      <EdEnd onLaunch={onLaunch} />
    </main>
  )
}

/* ===================== HERO ===================== */
function EdHero({ onLaunch }: { onLaunch: () => void }) {
  const ease = [0.16, 1, 0.3, 1] as const
  return (
    <section className="ed-hero">
      {/* structural vertical rules */}
      <div className="ed-rules" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <div className="ed-hero-grid">
        {/* LEFT — the manifesto */}
        <div className="ed-left">
          <motion.span
            className="mono tag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            [ a tool that checks real understanding ]
          </motion.span>

          <h1 className="ed-title">
            {['can you', 'explain it'].map((line, i) => (
              <span className="ed-line" key={i}>
                <motion.span
                  className="ed-word"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
            <span className="ed-line">
              <motion.span
                className="ed-word italic"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease, delay: 0.34 }}
              >
                yourself?
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="ed-blurb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Pick something you think you understand and explain it in your own
            words — like you’re telling a friend. This tool spots the exact
            sentence where you stop really explaining and start{' '}
            <em>repeating what you memorized</em>. Then it asks you one question
            that shows whether you truly get it.
          </motion.p>

          <motion.div
            className="ed-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.72 }}
          >
            <Show when="signed-in">
              <button className="ed-cta" onClick={onLaunch}>
                <span className="mono">→</span> open the tool
              </button>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="ed-cta">
                  <span className="mono">→</span> try it now
                </button>
              </SignInButton>
            </Show>
            <a className="ed-cta ghost" href="#process">
              see how it works
            </a>
          </motion.div>
        </div>

        {/* RIGHT — a plain, everyday example anyone can follow */}
        <motion.div
          className="ed-right"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease, delay: 0.4 }}
        >
          <span className="mono artifact-label">example · “why do we sleep?”</span>
          <div className="artifact">
            <p className="art-line">We sleep so the body can rest and recharge,</p>
            <p className="art-line">the brain sorts through the day’s memories,</p>
            <p className="art-line broke">
              and it’s basically how we restore our energy levels.
              <mark>just a phrase</mark>
            </p>
          </div>
          <div className="artifact-foot">
            <span className="mono">the question it asks ↴</span>
            <p>What actually runs out, that sleep puts back?</p>
          </div>
        </motion.div>
      </div>

      <div className="ed-hero-foot mono">
        <span>no grades</span>
        <span>no tests</span>
        <span>just one honest question</span>
      </div>
    </section>
  )
}

/* ===================== THESIS — big statement ===================== */
function EdThesis() {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="ed-thesis" ref={ref}>
      <span className="mono index" data-reveal>the idea</span>
      <p className="ed-big" data-reveal>
        It’s easy to <span className="hl">sound</span> like you understand
        something. You can repeat the words you’ve heard. The hard part is
        explaining <span className="hl">why</span> it’s true in your own words —
        and that’s the part this tool checks.
      </p>
    </section>
  )
}

/* ===================== PROCESS — what you'll actually do ===================== */
function EdProcess() {
  const ref = useReveal<HTMLElement>()
  const rows = [
    {
      n: '01',
      t: 'Pick something to explain',
      b: 'Choose a topic from the list. Don’t look anything up — you’re going to explain it from memory.',
    },
    {
      n: '02',
      t: 'Explain it in your own words',
      b: 'Type it out the way you’d tell a friend. There’s no “right wording” — just say what you actually think is going on.',
    },
    {
      n: '03',
      t: 'See where you got stuck',
      b: 'The tool shows you the one sentence where you stopped explaining and started repeating — and asks you a simple question about it.',
    },
    {
      n: '04',
      t: 'Try again, then decide',
      b: 'Answer the question in your own words. Then you (or whoever’s helping) decide honestly: did it actually click this time?',
    },
  ]
  return (
    <section id="process" className="ed-process" ref={ref}>
      <header className="ed-sec-head">
        <span className="mono index" data-reveal>how it works</span>
        <h2 className="ed-h2" data-reveal>Four simple steps. It takes a few minutes.</h2>
      </header>
      <ol className="ed-rows">
        {rows.map((r) => (
          <li className="ed-row" data-reveal key={r.n}>
            <span className="ed-row-n">{r.n}</span>
            <h3 className="ed-row-t">{r.t}</h3>
            <p className="ed-row-b">{r.b}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ===================== WHY — plain reasons to use it ===================== */
function EdMoves() {
  const ref = useReveal<HTMLElement>()
  const moves = [
    {
      n: '01',
      t: 'It’s not a test',
      b: 'There’s no score and no pass or fail. Nobody’s grading you. It just shows you where your understanding is thinner than it feels.',
    },
    {
      n: '02',
      t: 'It finds the exact spot',
      b: 'Instead of saying “you’re wrong somewhere,” it points at the one sentence where you switched from thinking to repeating.',
    },
    {
      n: '03',
      t: 'A person makes the final call',
      b: 'A computer finds the weak spot, but it never decides whether you “get it” now. A real person does. That keeps it honest.',
    },
    {
      n: '04',
      t: 'You can come back to it',
      b: 'Every attempt is saved privately to your account — only you can see yours — so you can watch your understanding actually improve.',
    },
  ]
  return (
    <section id="why" className="ed-mvs" ref={ref}>
      <span className="mono index" data-reveal>why people like it</span>
      <ul className="ed-mv-list">
        {moves.map((m) => (
          <li className="ed-mv" data-reveal key={m.n}>
            <span className="ed-mv-n">{m.n}</span>
            <span className="ed-mv-t">{m.t}</span>
            <span className="ed-mv-b">{m.b}</span>
            <span className="ed-mv-rule" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ===================== END ===================== */
function EdEnd({ onLaunch }: { onLaunch: () => void }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="ed-end" ref={ref}>
      <h2 className="ed-end-h" data-reveal>
        Pick something you think<br />you know. Let’s find out.
      </h2>
      <div className="ed-actions" data-reveal>
        <Show when="signed-in">
          <button className="ed-cta invert" onClick={onLaunch}>
            <span className="mono">→</span> open the tool
          </button>
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="ed-cta invert">
              <span className="mono">→</span> sign in and start
            </button>
          </SignInButton>
        </Show>
      </div>
    </section>
  )
}
