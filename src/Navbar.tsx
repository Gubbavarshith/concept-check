import { Show, SignInButton, UserButton } from '@clerk/react'

// Shared top navigation. Used on both the landing page and the tool page so
// the chrome stays identical across the app.
export function Navbar({
  onHome,
  onLaunch,
}: {
  onHome: () => void
  onLaunch: () => void
}) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={onHome} aria-label="Concept Check home">
          <span className="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M16 16l4.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-name">Concept Check</span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          <a href="#process" className="nav-link">
            How it works
          </a>
          <a href="#why" className="nav-link">
            Why use it
          </a>
        </nav>

        <div className="nav-actions">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="btn small">Sign in</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <button className="btn small" onClick={onLaunch}>
              Open the tool
            </button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
