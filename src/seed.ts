// The interface-lens concepts from info2.md. The learner picks one and derives
// it from first principles in their own words — there are no fixed questions.
// (In the real app these are seeded per-user in the DB on signup; this list is
// the local fallback so the UI works before login/DB wiring.)

export interface Concept {
  id: string
  name: string
  // The derivation prompt shown to the learner.
  prompt: string
}

export const CONCEPTS: Concept[] = [
  {
    id: 'backend',
    name: 'Why do we need a backend at all?',
    prompt:
      'Explain, from first principles, why a backend exists. Why not run everything in the browser?',
  },
  {
    id: 'interface',
    name: 'What is an interface, really?',
    prompt:
      'Explain what an interface is underneath the word — and what an API actually is.',
  },
  {
    id: 'front-back',
    name: 'Frontend vs backend',
    prompt: 'Explain what a frontend is, what a backend is, and why we need both.',
  },
  {
    id: 'chatgpt',
    name: 'What happens when you open the ChatGPT app?',
    prompt:
      'Walk through what goes on behind the scenes from the moment you open the app.',
  },
  {
    id: 'database',
    name: 'Why do we need a database?',
    prompt:
      'From first principles: what are the different ways to store data, and why do we need a database?',
  },
  {
    id: 'storage-choice',
    name: 'Choosing a storage option',
    prompt:
      'How do you choose one storage option over another? Which factors decide it?',
  },
]
