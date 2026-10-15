# DECISIONS

Every judgment call, with its reason. Authority order: the contract (`docs/task-contract.md`) > this file >
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
   Storage access can throw (blocked third-party storage, quota): persistence degrades
   silently — the toggle still switches, only the saved choice is lost — never a crash.
4. **V1 is a single-page form.** Cheapest correct thing; the wizard question belongs to V2
   together with reorder/progress. No router — two screens via plain state.
5. **Numeric input: `type="text" inputMode="numeric"`; typing is never blocked;
   validation gates submission** (and step-advance in V2). Out-of-range shows an error
   naming the range; a payload may never contain an out-of-range value (contract).
6. **Number parsing: locale-independent, integers-only grammar.** `.`, `,` and space are
   accepted only as well-formed thousands grouping (groups of three): `85.000`, `85,000`,
   `85 000` → 85000; `85.5`, `85.00`, `8 5000` → error. Locale-dependent parsing could
   silently read `85.000` as 85 EUR — the worst failure mode (wrong data, no error).
   Two refinements for the same reason: a grouped value may not start with 0 (`0.123`
   reads as a float → error; plain `007` stays unambiguous → 7), and values beyond
   `Number.MAX_SAFE_INTEGER` error instead of silently rounding to a different integer.
7. **Prefill validity = input validation only** (type, option membership, min/max).
   Screening rules never gate prefill: profile's 95000 is prefilled against
   `must_be_below: 90000`, editable, and may fail screening at submit. Keeps `prefill.ts`
   and `screening.ts` independent and avoids leaking thresholds.
8. **Screening never blocks input, pages, or submission.** Evaluated at submit into the
   payload — the contract's own example is a submitted payload with `passed: false`.
9. **File types: contract wins.** PDF/DOCX/PNG/JPG ≤ 5 MB everywhere; recruiter prose
   ("bitte ausschließlich als PDF") renders as written but is never parsed for intent.
10. **Normalization policy: drop the smallest broken thing, console-warn, never invent data.**
    - Missing `id`/`question`/`type` → drop the question.
    - Malformed option → drop the option; duplicate option values → first wins, warn;
      zero valid options left → drop the question.
    - Rule value failing its documented type (`must_be_at_least: "five"`) → drop the rule,
      keep the question.
    - `must_be_true` is `z.boolean()`: `false` means "rule off" — legitimate semantics,
      no warning (the contract's letter says the value is `true`; behavior is identical).
    - Question text > 255 chars → render normally, warn only (authoring limit, not the
      candidate's problem).
    - Inverted numeric range (`min` > `max`) → drop the question, warn: no answer can
      satisfy it, so a required one would dead-end submission (decision #5). Enforced by
      a schema `.refine`, so it rides the normal invalid-question path.
    - **Order: drop invalid questions first, then dedupe IDs** — an ignored question must
      not shadow a valid later question with the same ID.
    - Job-level invalid (no id / zero valid questions) → error/empty state in the UI,
      never a crash. The job shell (`title`, `company`, `language`) is held to the same
      bar: a job we can't display honestly is an error result, never invented defaults.
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
17. **Two schema choices a later reader might "fix":** `profile_field` is a plain string,
    not `z.enum(PROFILE_FIELDS)` — an unknown value must keep its question and simply
    never prefill, not drop it (the enum lives in `PROFILE_FIELDS` for `prefill.ts`).
    And `SCREENING_RULES` is exported even though the per-type schemas encode the same
    facts: #10 demands a *warning* for stripped rules, zod strips/rejects them silently,
    so normalize pre-checks the raw object against this table — delete it and the
    warnings lose their only source of rule → type knowledge.
18. **Issues on GitHub** (`soheilaghayour/question-flow`, private): 10 V1 issues
    (`v1`, `ready-for-agent`) then 7 V2 issues (`v2`, `needs-triage`), ordered by title prefix.
19. **Payload omission policy: a value with no substance is "no answer", and a wrong-shape
    value is omitted, never coerced.** Whitespace-only text/date, `''` from an unselected
    single-select and a zero-pick multi-select are all left out (contract: leave out optional
    questions that have no answer). Each payload arm accepts only its own value type — a
    boolean under a numeric question (or any other cross-type wiring bug) is dropped rather
    than shipped, because the payload is the last line before the backend and must never
    invent or reinterpret data. Numeric answers must be integers (contract: integers only;
    NaN would serialize to `null`), a cleared input may hold `null` (= no answer), and
    text/date answers are emitted trimmed — padding never reaches the wire, dates must be
    exactly `YYYY-MM-DD`. Silent (no console warning), unlike normalize #10: config
    problems are the recruiter's bug to hear about; form-state problems are ours, caught
    by tests.
20. **CI with GitHub Actions on push to `main` and every PR: typecheck, lint, test, build.**
    Single job, no matrix: one Node version is enough for a browser app. Superseded runs
    are cancelled on PRs only, never on `main`, so every main commit gets a full run.
    The CI badge landed with #28, once `README.md` stopped being the frozen template
    fixture (see #23). Deployment is a separate step after v1.

21. **Question components are controlled and share one seam:**
    `{ question, value, onChange, error? }` (`QuestionComponent` in `registry.ts`).
    The flow owns answers and required-errors (#1, #2); components emit `null` for
    "no answer" (cleared text, last pick removed), so form state only ever holds real
    answers (#19). Two local exceptions, both inherent to the widget: NumericQuestion
    keeps the raw string ("85." has no number representation; typing is never blocked,
    #5) and shows parse/range errors itself — a parse error says only "enter a whole
    number" (bounds may be schema defaults the job never set; the range is named only
    for range errors, #5), the raw text re-syncs when the value prop changes to
    something other than the echo of its own last emit (external reset, post-mount
    prefill), and `domain/numericAnswer.ts` is the single owner of "integer within
    bounds" shared with prefill; FileQuestion stores the issue kind
    (type/size/read-failure) so a language toggle re-translates a visible error.
    File selection is defensive end to end: FileDrop re-validates every selection
    (drag & drop and "All files" pickers bypass the browser's `accept` filter) and
    resets the input after each one (same-named re-picks fire no change event
    otherwise); an empty browser MIME falls back to the file extension — the
    contract mandates formats, not MIME sniffing as the mechanism, while a reported
    non-contract type still rejects; a slow base64 read never overwrites a later
    selection (latest-wins sequence guard); a failed read shows its own retryable
    error instead of silently keeping the previous file.
    Groups (boolean, select) associate label and error via
    the OptionGroup molecule (fieldset/legend, #12) since no single input exists for
    a `<label for>`. The flow renders any Question through `QuestionField`, which owns
    the single correlated-union cast the registry lookup needs (TS#30581) — call sites
    never cast and never switch on type; the cast is sound because answers only ever
    hold what the same question's component emitted, re-checked per type in payload.ts.

22. **The submit gate is required-missing only.** Components hold invalid input as
    `null` (#21), so an invalid required field blocks through the same check as an
    empty one — `missingRequired` in `formState.ts` mirrors payload's no-substance
    rule (#19: whitespace-only text and zero-pick lists don't count; `false` does).
    An optional field with unparseable input submits with that answer omitted: the
    widget's inline error already told the user, and the payload stays contract-safe
    (it never carries an invalid value). Lifting widget validity into form state was
    rejected — it would reopen the #21 seam for a V2-sized UX refinement.
    The submit screen renders the payload inside `<output>` (implicit `status` role):
    accessible announcement for free, and the integration tests read it by role. The
    submitted payload lives in a second, phase-local `useState` beside `FormState` —
    #1's "single state object" governs *form* state; the submitted screen is a phase,
    not an answer.
    The language toggle UI ships with V1-10, not V1-08: the i18n machinery (#3)
    had no page to live on until the first page existed. The toggle is labeled
    with the language it switches TO, in that language — readable exactly when
    the current UI language is the wrong one.
23. **The task contract moved verbatim from `README.md` to `docs/task-contract.md`** (#28,
    `git mv`, byte-identical — it stays a frozen fixture). Only its path changed, never its
    content or authority: it remains the top of the authority order. This frees `README.md`
    to be a real project README (what this is, how to run it, CI badge, doc links) — the
    first file a reviewer opens should not be mock-data documentation. All references that
    meant the contract (CLAUDE.md, this file, PRD.md, code comments) now say "contract"
    or name `docs/task-contract.md` explicitly.

## Open PM questions

- Should candidates learn they failed screening, and in what wording? (V2 messaging;
  V1's dev view exposes it in the raw payload.)
- `bad.json` demands "PDF only" in prose but the contract allows four types — should file
  questions get an `accepted_types` config field? Until then the contract wins.
- The rule names mislead about their mechanism: `must_be_at_least`/`must_be_below`/
  `must_be_true` read like input validation, but they gate screening, not submission
  (an answer that fails them still submits). Names like `screening_min` would say which
  mechanism fires. Contract keys are frozen, so rename only if the contract ever revs.
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
