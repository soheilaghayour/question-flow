# DECISIONS

Every judgment call, with its reason. Authority order: README contract > this file >
`CLAUDE.md` — if they disagree, the higher wins and the lower is corrected in the same commit.

## Decisions

1. **Form state: single `useState<FormState>` object + pure transition functions**
   (`formState.ts`: `answerChanged`, `submitAttempted`, …) fed to the functional setter.
   react-hook-form would be a second validation brain beside `domain/`; a single state
   object updates atomically; pure transitions stay unit-testable without React.
   *Revisit:* switch to `useReducer` if V2 step logic grows.
2. **Context only for the i18n language, never for form state.** Props are one level deep
   (`ApplyFlow` → question component); context would hide data flow and couple components
   to a provider for no transport win.
3. **Default UI language: browser language → English fallback; manual toggle overrides,
   persisted in localStorage.** Job `language` describes the recruiter's text, not the
   reader's preference. Only UI chrome is translated; recruiter text renders verbatim.
4. **V1 is a single-page form.** Cheapest correct thing; the wizard question belongs to V2
   together with reorder/progress. No router — two screens via plain state.
5. **Numeric input: `type="text" inputMode="numeric"`; typing is never blocked;
   validation gates submission** (and step-advance in V2). Out-of-range shows an error
   naming the range; a payload may never contain an out-of-range value (contract).
6. **Number parsing: locale-independent, integers-only grammar.** `.`, `,` and space are
   accepted only as well-formed thousands grouping (groups of three): `85.000`, `85,000`,
   `85 000` → 85000; `85.5`, `85.00`, `8 5000` → error. Locale-dependent parsing could
   silently read `85.000` as 85 EUR — the worst failure mode (wrong data, no error).
7. **Prefill validity = input validation only** (type, option membership, min/max).
   Screening rules never gate prefill: profile's 95000 is prefilled against
   `must_be_below: 90000`, editable, and may fail screening at submit. Keeps `prefill.ts`
   and `screening.ts` independent and avoids leaking thresholds.
8. **Screening never blocks input, pages, or submission.** Evaluated at submit into the
   payload — the README's own example is a submitted payload with `passed: false`.
9. **File types: contract wins.** PDF/DOCX/PNG/JPG ≤ 5 MB everywhere; recruiter prose
   ("bitte ausschließlich als PDF") renders as written but is never parsed for intent.
10. **Normalization policy: drop the smallest broken thing, console-warn, never invent data.**
    - Missing `id`/`question`/`type` → drop the question.
    - Malformed option → drop the option; duplicate option values → first wins, warn;
      zero valid options left → drop the question.
    - Rule value failing its documented type (`must_be_at_least: "five"`) → drop the rule,
      keep the question.
    - `must_be_true` is `z.boolean()`: `false` means "rule off" — legitimate semantics,
      no warning (README's letter says the value is `true`; behavior is identical).
    - Question text > 255 chars → render normally, warn only (authoring limit, not the
      candidate's problem).
    - **Order: drop invalid questions first, then dedupe IDs** — an ignored question must
      not shadow a valid later question with the same ID.
    - Job-level invalid (no id / zero valid questions) → error/empty state in the UI,
      never a crash.
11. **Date: native `<input type="date">`** (value already `YYYY-MM-DD`, no timezone math);
    `min` = today computed from **local** date parts (never `toISOString`). V1 validation
    is format-only — a hand-typed past date passes (see open questions).
12. **Accessibility baseline in V1:** label/input association, `aria-invalid`,
    `aria-describedby` for errors.
13. **Styling: Tailwind v4 + semantic color tokens in `@theme`; atoms are the role layer.**
    `Input.tsx` is the single place input styling lives, so role-level changes are
    one-file edits. Discipline rules in `CLAUDE.md`: colors only by role; raw styling only
    in `atoms/`/`molecules/`, pages add layout classes only.
14. **i18n: hand-rolled typed `t(key)` + React context.** ~30 UI strings don't justify i18next.
15. **V1 submit screen: payload as `<pre>` JSON including `screening`, plus `console.log`.**
    Dev-facing deliverable; humanized in V2.
16. **TypeScript pinned to the 6.x line (not 7.x).** npm resolves `typescript` to 7.x (the
    Go-based compiler), but typescript-eslint rejects TS 7.0 at runtime, which breaks
    `npm run lint`. TS 6 is the API-compatible release typescript-eslint supports.
    *Revisit:* unpin when typescript-eslint ships TS ≥ 7.1 support
    (typescript-eslint/typescript-eslint#10940).
17. **Issues on GitHub** (`soheilaghayour/instaffo-question-flow`, private): 10 V1 issues
    (`v1`, `ready-for-agent`) then 7 V2 issues (`v2`, `needs-triage`), ordered by title prefix.

## Open PM questions

- Should candidates learn they failed screening, and in what wording? (V2 messaging;
  V1's dev view exposes it in the raw payload.)
- `bad.json` demands "PDF only" in prose but the contract allows four types — should file
  questions get an `accepted_types` config field? Until then the contract wins.
- `min: 5` on `react_years` is a hidden knockout: an honest 3-year candidate can never
  submit. Disallow in config authoring, or auto-convert to `must_be_at_least`?
- The 255-char question limit: enforce recruiter-side at authoring time? Candidate side
  only console-warns.
- `starting_date`: should past dates be invalid? V1 is format-only with a soft
  `min=today` on the input.
- `must_be_true: false` is treated as "rule off" silently — a recruiter who typo'd `false`
  meaning `true` loses their knockout without a trace. Authoring-side validation?

## Rejected approaches

- **react-hook-form + zod resolver** — would generate a runtime schema per job and
  duplicate `domain/` validation; two brains to keep in sync.
- **React context for form state** — transport fix for a drilling problem that doesn't
  exist; hides data flow, forces provider wrappers in every test.
- **One strict zod schema for the whole job** — one bad question would reject the entire
  job; per-question `safeParse` contains the damage.
- **Prefill blocked by screening rules** — entangles `prefill.ts` with `screening.ts`,
  creates cross-layer exceptions, and leaks thresholds (the vanished prefill is a hint).
- **Parsing recruiter prose for intent** (file types, knockouts) — natural-language
  sniffing in two languages, untestable, wrong on "PDF bevorzugt".
- **Locale-dependent number parsing** — English locale reads `85.000` as 85 EUR, silently.
- **`<input type="number">`** — cross-browser separator behavior is untestable.
- **CSS modules + tokens.css** — equivalent power, but atoms-as-role-layer + `@theme`
  semantic tokens give the same single-point changes with co-located styling.
- **react-router** — no deep-link or URL-state requirement in V1.
- **i18next** — library weight for ~30 strings.

## Left out and why

- **Backend / real submission** — payload on screen + console is the contract deliverable.
- **`rating` question type** — unknown type per contract; dropped by normalize, by design.
- **Case-conversion layer** — forbidden; contract keys stay snake_case end to end.
- **Drafts, reordering, intro screen, progress, screening messaging** — V2 by plan,
  V1 ships correctness first.
- **Profile editing** — the profile is a read-only fixture.
