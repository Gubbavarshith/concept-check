// Shared footer. Used on both the landing page and the tool page.
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark small" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M16 16l4.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <p className="footer-name">Concept Check</p>
            <p className="footer-tag">
              A simple way to find out if you really understand something — or if
              you’re just repeating words you’ve heard.
            </p>
          </div>
        </div>

        <nav className="footer-cols" aria-label="Footer">
          <div className="footer-col">
            <span className="footer-col-title">Learn more</span>
            <a href="#process">How it works</a>
            <a href="#why">Why use it</a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Concept Check.</span>
        <span>No grades. No tests. Just one honest question.</span>
      </div>
    </footer>
  )
}
