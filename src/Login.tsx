import { useState } from 'react'
import { useAuth } from './auth'

// One screen, two modes (sign in / sign up). Self-explanatory: the heading says
// what the app is, the toggle is obvious, errors show inline.

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setNotice(null)
    setBusy(true)
    const err =
      mode === 'in'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password)
    setBusy(false)
    if (err) {
      setError(err)
    } else if (mode === 'up') {
      // If email confirmation is on, there's no session yet — tell them.
      setNotice('Account created. If sign-in doesn’t happen automatically, check your email to confirm, then sign in.')
    }
  }

  return (
    <div className="page narrow">
      <header className="head">
        <h1>Concept Check</h1>
        <p className="sub">
          A tool that tells you whether you truly understand a concept — or only
          know the words for it. Sign in to start.
        </p>
      </header>

      <main className="card">
        <div className="tabs">
          <button
            className={`tab ${mode === 'in' ? 'on' : ''}`}
            onClick={() => {
              setMode('in')
              setError(null)
              setNotice(null)
            }}
          >
            Sign in
          </button>
          <button
            className={`tab ${mode === 'up' ? 'on' : ''}`}
            onClick={() => {
              setMode('up')
              setError(null)
              setNotice(null)
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-notice">{notice}</div>}

          <button className="btn full" type="submit" disabled={busy}>
            {busy
              ? 'Working…'
              : mode === 'in'
                ? 'Sign in →'
                : 'Create account →'}
          </button>
        </form>
      </main>
    </div>
  )
}
