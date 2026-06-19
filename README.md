# Concept Check (Track A)

A tool that tells a learner whether they **truly understand** a concept or only
**recognize the words** for it. The learner derives a concept from first
principles in their own words; the tool returns one thing — the single sentence
where their explanation stopped being reasoning and became a memorized label,
plus the one follow-up question that exposes it. Then it checks whether, once
the gap is named, they can actually close it.

Not a score. Not a quiz. A diagnosis of the gap.

## The concept tested

The **interface lens** — "Why do we need a backend at all?", "What is an
interface, really?", frontend vs backend, what happens when you open the ChatGPT
app, why we need a database, and how to choose a storage option. Things every
cohort-mate has seen, so nobody can say "I never learned this." If they truly
understood it, they can derive it; if they only memorized it, they cannot.

## The Move 3 boundary (decided on purpose)

The whole engineering skill is knowing where **not** to let the model decide.

- **Probabilistic (the model, in a server-side Edge Function):** find the gap
  sentence, write the exposing follow-up.
- **Deterministic / human:** the list of concepts, every session record, the
  link from a named gap to its second-pass result, the access rules — and, most
  importantly, **whether the second derivation actually closed the gap.**

**Who judges the second derivation: a human, not the model.** A soft model judge
tells everyone they passed, which would sink the entire claim at the exact point
it lives or dies. The accepted failure mode: human judging is slower and doesn't
scale — fine here, because the value is two deep cases, not a rate.

## Stack

- **Frontend:** React + Vite + TypeScript, plain CSS.
- **Backend:** Supabase (Postgres + Auth + Row-Level Security).
- **The diagnoser:** a Supabase Edge Function that calls the Anthropic API
  server-side, so the API key never reaches the browser.

## Data model

`concepts` → `sessions` → `derivations`. The `derivations` table is the heart:
it holds the first explanation (before), the model's gap + follow-up, the retry
(after), and the **human's verdict on whether the gap closed** — the gap→result
link that is both the evidence and the metric.

## How this maps to the assignment

| Move | Where |
|------|-------|
| 1 — watch two real people | submitted separately (raw records) |
| 2 — hypothesis, before code | `HYPOTHESIS.md`, the **first commit** |
| 3 — deterministic/probabilistic boundary | this README + hand-drawn diagram |
| 4 — domain model + two-user RLS test | Supabase schema + hand-drawn diagram |
| 5 — two people, before/after + a surprise | submitted separately |

## Run locally

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + publishable key
npm run dev
```
