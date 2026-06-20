// Calibration exemplars from the Move 1 by-hand sessions (real people, graded
// by hand). These are REFERENCE, not the grading bar: the first-principles
// criteria remain the standard. Showing a real graded answer next to a new one
// lets the human judge calibrate what "still reciting a label" actually looks
// like. Both real sessions broke the same way — reaching for a memorized
// security phrase instead of reasoning — which is exactly the pattern to show.

export interface Calibration {
  person: string
  answer: string // what they actually said
  grade: 'closed' | 'partly' | 'not_closed'
  note: string // why it was graded that way — the teaching point
}

// Keyed by concept name (must match the seed concept names in db.ts).
export const CALIBRATION: Record<string, Calibration> = {
  'What is an interface, really?': {
    person: 'Yash (Move 1 session)',
    answer:
      'An interface is the experience — what you interact with when you open an app or website. If it’s user-friendly and easy to navigate, the interface wins.',
    grade: 'not_closed',
    note: 'Describes how an interface looks/feels, never what it IS underneath — a defined boundary where two sides agree how to talk without knowing each other’s internals. Stayed at the visible label, never reached the mechanism.',
  },
  'Why do we need a database?': {
    person: 'Hansh (Move 1 session)',
    answer:
      'We store data securely because it’s encrypted — if a hacker gets in, the password is hashed with a salt, so they can’t read it. The backend has the decryption key to check it.',
    grade: 'not_closed',
    note: 'Reached for memorized security phrases ("encrypted", "salt", "decryption key") instead of deriving why a database exists at all. Also factually off: hashing is one-way — you don’t decrypt it. A classic recited-label answer.',
  },
}
