// Editorial / paper theme for every Clerk component (sign-in modal, UserButton,
// etc.). Set once on ClerkProvider so the popup matches the landing page:
// warm paper ground, near-black ink, a single editorial-red accent, square
// corners, Fraunces display + JetBrains Mono labels.
const PAPER = '#f4f1ea'
const INK = '#14110d'
const RED = '#c0341d'
const LINE = '#d8d2c5'
const MUTED = '#6b6356'

export const clerkAppearance = {
  variables: {
    colorPrimary: INK,
    colorText: INK,
    colorTextSecondary: MUTED,
    colorBackground: PAPER,
    colorInputBackground: '#fbfaf6',
    colorInputText: INK,
    colorDanger: RED,
    borderRadius: '0px',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontFamilyButtons: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: '15px',
  },
  elements: {
    // The modal card
    rootBox: { fontFamily: "'Inter', system-ui, sans-serif" },
    card: {
      backgroundColor: PAPER,
      border: `1.5px solid ${INK}`,
      borderRadius: '0',
      boxShadow: '0 24px 60px rgba(20, 17, 13, 0.28)',
    },
    modalContent: { borderRadius: '0' },

    // Header
    headerTitle: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: '600',
      letterSpacing: '-0.02em',
      color: INK,
    },
    headerSubtitle: { color: MUTED },

    // Primary action button (Continue / Sign in)
    formButtonPrimary: {
      backgroundColor: INK,
      color: PAPER,
      border: `1.5px solid ${INK}`,
      borderRadius: '0',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: '400',
      letterSpacing: '0.02em',
      textTransform: 'none',
      boxShadow: 'none',
      transition: 'background 0.18s, border-color 0.18s',
      '&:hover': { backgroundColor: RED, borderColor: RED },
      '&:focus': { boxShadow: `0 0 0 2px rgba(192,52,29,0.25)` },
    },

    // Social buttons (Google etc.)
    socialButtonsBlockButton: {
      border: `1.5px solid ${LINE}`,
      borderRadius: '0',
      backgroundColor: '#fbfaf6',
      '&:hover': { borderColor: INK, backgroundColor: PAPER },
    },
    socialButtonsBlockButtonText: { color: INK, fontWeight: '500' },

    // Inputs
    formFieldInput: {
      backgroundColor: '#fbfaf6',
      border: `1.5px solid ${INK}`,
      borderRadius: '0',
      color: INK,
      '&:focus': {
        borderColor: RED,
        boxShadow: `0 0 0 2px rgba(192,52,29,0.18)`,
      },
    },
    formFieldLabel: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      color: MUTED,
    },

    // Dividers / links / footer
    dividerLine: { backgroundColor: LINE },
    dividerText: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '11px',
      textTransform: 'uppercase',
      color: MUTED,
    },
    footerActionLink: {
      color: RED,
      fontWeight: '600',
      '&:hover': { color: INK },
    },
    formFieldAction: { color: RED },
    identityPreviewEditButton: { color: RED },

    // Hide Clerk's "Secured by" badge for a cleaner premium look
    footer: { display: 'none' },

    // UserButton dropdown (keeps the same language in the tool navbar)
    userButtonPopoverCard: {
      borderRadius: '0',
      border: `1.5px solid ${INK}`,
      backgroundColor: PAPER,
    },
    userButtonPopoverActionButton: {
      borderRadius: '0',
      '&:hover': { backgroundColor: '#ece7dc' },
    },
  },
}
