# DECISIONS

Every judgment call, with its reason. Authority order: the contract (`docs/task-contract.md`) > this file >
`CLAUDE.md` — if they disagree, the higher wins and the lower is corrected in the same commit.

## What I built

The application is an end-to-end candidate application flow that normalizes raw job configs, prefills matching candidate profile fields, and guides the candidate through a multi-step wizard. Prefilled answers lead as an editable confirmation step, followed by open questions chunked three per step in config order, and conclude with a read-only review step. Submitting logs the contract-compliant JSON payload (including screening results) to the browser console and renders a candidate-facing confirmation screen with generic messaging if requirements are unmet. The interface supports English and German; the choice is saved in this browser, and Back never changes it. Core domain logic (normalization, validation, prefill, screening, and payload generation) is pure and covered by tests; CI (GitHub Actions) runs typecheck, lint, test and build.

## Decisions

### Contract & data

D6. **Number parsing: locale-independent, integers-only grammar.** `.`, `,` and space are
    accepted only as well-formed thousands grouping (groups of three): `85.000`, `85,000`,
    `85 000` → 85000; `85.5`, `85.00`, `8 5000` → error. Locale-dependent parsing could
    silently read `85.000` as 85 EUR — the worst failure mode (wrong data, no error).
    Two refinements for the same reason: a grouped value may not start with 0 (`0.123`
    reads as a float → error; plain `007` stays unambiguous → 7), and values beyond
    `Number.MAX_SAFE_INTEGER` error instead of silently rounding to a different integer.

D7. **Prefill validity = input validation only** (type, option membership, min/max).
    Screening rules never gate prefill: profile's 95000 is prefilled against
    `must_be_below: 90000`, editable, and may fail screening at submit. Keeps `prefill.ts`
    and `screening.ts` independent and avoids leaking thresholds.

D8. **Screening never blocks input, pages, or submission.** Evaluated at submit into the
    payload — the contract's own example is a submitted payload with `passed: false`.

D9. **File types: contract wins.** PDF/DOCX/PNG/JPG ≤ 5 MB everywhere; recruiter prose
    ("bitte ausschließlich als PDF") renders as written but is never parsed for intent.

D10. **Normalization policy: drop the smallest broken thing, console-warn, never invent data.**
     - Missing `id`/`question`/`type` → drop the question.
     - Malformed option → drop the option; duplicate option values → first wins, warn;
       zero valid options left → drop the question. A whitespace-only option value counts
       as malformed, so a picked option is always an answer.
     - Rule value failing its documented type (`must_be_at_least: "five"`) → drop the rule,
       keep the question.
     - `must_be_true` is `z.boolean()`: `false` means "rule off" — legitimate semantics,
       no warning (the contract's letter says the value is `true`; behavior is identical).
     - Question text > 255 chars → render normally, warn only (authoring limit, not the
       candidate's problem).
     - Inverted numeric range (`min` > `max`) → drop the question, warn: no answer can
       satisfy it, so a required one would dead-end submission (decision D5). Enforced by
       a schema `.refine`, so it rides the normal invalid-question path.
     - **Order: drop invalid questions first, then dedupe IDs** — an ignored question must
       not shadow a valid later question with the same ID.
     - Job-level invalid (no id / zero valid questions) → error/empty state in the UI,
       never a crash. The job shell (`title`, `company`, `language`) is held to the same
       bar: a job we can't display honestly is an error result, never invented defaults.

D17. **Two schema choices a later reader might "fix":** `profile_field` is a plain string,
     not `z.enum(PROFILE_FIELDS)` — an unknown value must keep its question and simply
     never prefill, not drop it (the enum lives in `PROFILE_FIELDS` for `prefill.ts`).
     And `SCREENING_RULES` is exported even though the per-type schemas encode the same
     facts: D10 demands a *warning* for stripped rules, zod strips/rejects them silently,
     so normalize pre-checks the raw object against this table — delete it and the
     warnings lose their only source of rule → type knowledge.

D19. **Payload omission policy: a value with no substance is "no answer", and a wrong-shape
     value is omitted, never coerced.** Whitespace-only text/date, `''` from an unselected
     single-select and a zero-pick multi-select are all left out (contract: leave out optional
     questions that have no answer). Each payload arm accepts only its own value type — a
     boolean under a numeric question (or any other cross-type wiring bug) is dropped rather
     than shipped, because the payload is the last line before the backend and must never
     invent or reinterpret data. Numeric answers must be integers (contract: integers only;
     NaN would serialize to `null`), a cleared input may hold `null` (= no answer), and
     text/date answers are emitted trimmed — padding never reaches the wire, dates must be
     exactly `YYYY-MM-DD`. Silent (no console warning), unlike normalize D10: config
     problems are the recruiter's bug to hear about; form-state problems are ours, caught
     by tests.

D23. **The task contract moved verbatim from `README.md` to `docs/task-contract.md`** via
     `git mv`, byte-identical; it stays a frozen fixture. Only its path changed, never its
     content or authority: it remains the top of the authority order. This frees `README.md`
     to be a real project README (what this is, how to run it, CI badge, doc links) — the
     first file a reviewer opens should not be mock-data documentation. All references that
     meant the contract (CLAUDE.md, this file, PRD.md, code comments) now say "contract"
     or name `docs/task-contract.md` explicitly.

D24. **Candidates see the same neutral confirmation whatever the screening result.** Telling
     them they failed helps nobody and hints at recruiter thresholds. Screening never blocks
     submission (D8); its result goes only into the payload (`console.log`).

### Form & state

D2. **Context only for the i18n language, never for form state.** Props are one level deep
    (`ApplyFlow` → question component); context would hide data flow and couple components
    to a provider for no transport win.

D5. **Numeric input: `type="text" inputMode="numeric"`; typing is never blocked;
    validation gates submission** (and step-advance in D30). Out-of-range shows an error
    naming the range; a payload may never contain an out-of-range value (contract).

D11. **Date: native `<input type="date">`** (value already `YYYY-MM-DD`, no timezone math);
     `min` = today computed from **local** date parts (never `toISOString`). V1 validation
     is format-only — a hand-typed past date passes (see open questions).

D21. **Question components are controlled and share one seam:**
     `{ question, value, onChange, error? }` (`QuestionComponent` in `registry.ts`).
     The flow owns answers and required-errors (D2); components emit `null` for
     "no answer", so form state only ever holds real answers (D19). Two local exceptions
     are inherent to the widget: `NumericQuestion` keeps the raw string (typing is never
     blocked, D5) and manages parse/range errors locally; `FileQuestion` stores the issue kind
     so a language switch re-translates visible errors. Group questions (boolean, select)
     associate label and error via `OptionGroup` (fieldset/legend, D12). Implementation mechanics
     (FileDrop re-validation, input reset, MIME fallback, latest-wins guard, and registry union casting)
     are documented in code comments.

D22. **The step gate is required-missing only.** Components hold invalid input as
     `null` (D21), so an invalid required field blocks through the same check as an
     empty one (`missingRequired` in `answers.ts` mirrors D19's no-substance rule).
     An optional field with unparseable input submits with that answer omitted: the
     widget's inline error already told the user, and the payload stays contract-safe.

### UX & flow

D26. **Required fields are marked with a red `*` plus a one-line legend; screen readers
     get `aria-required` instead.** The star is `aria-hidden` and lives OUTSIDE the
     `<label>`/inside the `<legend>` such that accessible names never change — queries
     and screen-reader announcements stay stable. (No `aria-required` on fieldsets: the
     `group` role doesn't support it.)

D27. **The native file input is visually hidden behind a "Choose file" button.** Because
     `FileDrop` resets the input value after every selection (same-file re-pick, D21), the
     native widget displayed "no file chosen" while a file was held in form state. Hiding
     the input makes the file-name line the single source of truth; the button and the
     question label both trigger the picker.

D29. **The job page has three columns; a job can be applied to once.** Clicking through,
     prefill looked like magic: the profile was invisible, and the overview page was bare. The
     job list sits on the left, the selected job in the center, and a `ProfileCard` on the right
     so candidates see where prefilled values come from. Applied job ids are stored in
     localStorage to survive a refresh.

D30. **The apply form is a wizard: prefill confirm first, 3 questions per step, light
     summary before submit**. The lesson from rejected focus mode (see
     Rejected approaches): prefilled answers lead as one editable confirm step so they read as
     completed work. Open questions follow in config order (3 per step), ending in a read-only
     review step with the sole Submit button. "Next" gates on the current step's required answers
     with inline errors (the step-advance gating D5 planned); Back and typing are ungated, with
     answers preserved. Progress is a step line ("Step X of Y", including summary)
     animated under motion-safe only. Screening never blocks (D8).

D31. **The wizard's Next and Submit buttons are the main call to action.**

D35. **Every screen has a URL (react-router)**.

D36. **The app header is sticky and sits outside `<main>`**: `position: sticky`, not `fixed`,
     so it stays in the flow and needs no layout offset; outside `<main>` it is the page's banner
     landmark. `scroll-padding-top` (6rem, enough for a title wrapped on phones) keeps fields scrolled into view (Tab) clear of it.

D37. **A wizard step sits in the overview's `Card`; options are wrapping pills**. Pills keep
     the visible radio or checkbox, so "pick one" and "pick several" still look different; the
     7-level German question fits one row. The prefill step opens with an info callout that is
     still the step's heading.

D38. **"Choose file" is a secondary button with a visual error state**: a solid primary
     button mid-step competed with Next (D31). `aria-invalid` isn't supported on buttons, so the
     red border and text are visual; the error stays linked via `aria-describedby`.

D39. **Every field reserves one line for its error**, so an error appearing after Next never
     pushes the fields below it down. A message longer than one line still shifts the layout.

### Styling & i18n

D3. **The UI language lives in React state, saved in localStorage; English on a first visit**.
    Switching adds no history entry, so Back and Forward never change the language, and the
    wizard keeps its step and answers. Job `language` describes the recruiter's text, not the
    reader's preference. Only UI chrome is translated; recruiter text renders verbatim.

D12. **Accessibility baseline in V1:** label/input association, `aria-invalid`,
     `aria-describedby` for errors.

D13. **Styling: Tailwind v4 + semantic color tokens in `@theme`; `components/ui/` is the role layer.**
     `Input.tsx` is the single place input styling lives, so role-level changes are
     one-file edits. Discipline rules in `CLAUDE.md`: colors only by role; screen
     components add layout classes only.
     Text roles are `ui/` components too: `Text` (element, tone, size and weight props, never caller color classes) and `Heading`; `ErrorText` and `RequiredMark` build on `Text`. Error messages always go through `ErrorText`, so they keep `role="alert"`. Components outside `ui/` add only layout and box styling. Tests check behavior and semantics, never class names: asserting exact CSS class names in unit tests is widely recognized as an anti-pattern.

D14. **i18n: hand-rolled typed `t(key)` + React context.** ~30 UI strings don't justify i18next.

D28. **Focus rings fire on `:focus-visible` only**, so mouse clicks don't paint stray borders
     on radios and checkboxes.

D32. **The job list is navigation and Apply is the page's only solid primary button**.
     Jobs are links with `aria-current="page"` and a tinted active state, so the selected job
     no longer competes with Apply. An applied job shows an "Applied" badge in the list and
     in Apply's place, never a disabled button: the badge says why, and the title stays put
     when switching jobs. Job links use the `NavItem` ui component; the language switch's
     `CurrentButton` mirrors its current style (primary text on a tint with a primary outline, so it
     doesn't rely on color alone).

### Engineering

D16. **TypeScript pinned to the 6.x line (not 7.x).** npm resolves `typescript` to 7.x (the
     Go-based compiler), but typescript-eslint rejects TS 7.0 at runtime, which breaks
     `npm run lint`. TS 6 is the API-compatible release typescript-eslint supports.
     *Revisit:* unpin when typescript-eslint ships TS ≥ 7.1 support
     (typescript-eslint/typescript-eslint#10940).

D20. **CI with GitHub Actions on push to `main` and every PR: typecheck, lint, test, build.**
     Single job, no matrix: one Node version is enough for a browser app. Superseded runs
     are cancelled on PRs only, never on `main`, so every main commit gets a full run.
     Deployment is a separate, later step.

D40. **Code lives next to its only user and moves to the nearest common folder once shared;
     `components/ui/` is the design system and always shared.**

## Open PM questions

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

- **Focus mode: spotlight the active question, dim the rest to ~45%** — built,
  trialed live, discarded. Dimming fights prefill: exactly the questions the profile
  already answered rendered de-emphasized, so the top of the form read as disabled
  rather than done. Replaced by the wizard (D30), which frames prefill as a completed
  step instead of dimmed noise.
- **Modal for the apply form** — a long multi-question form with file uploads inside a
  modal means scroll-in-scroll, focus-trap work, and an accidental backdrop click loses all answers.
- **UI language in the URL (`/de/...`)** — every history entry keeps the language it was
  visited in, so Back after a switch returned to the previous page in the old language.
  Shareable language links are worth little in an application wizard.
- **Translating recruiter text on language switch** — would invent data; question/option
  texts are recruiter content (D3); payload carries original values.
- **react-hook-form + zod resolver** — would generate a runtime schema per job and
  duplicate the validation in the pure logic files; two brains to keep in sync.
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
- **CSS modules + tokens.css** — equivalent power, but `ui/`-as-role-layer + `@theme`
  semantic tokens give the same single-point changes with co-located styling.
- **i18next** — library weight for ~30 strings.

## Left out and why

- **Backend / real submission** — payload in console + candidate confirmation is the contract deliverable.
- **`rating` question type** — unknown type per contract; dropped by normalize, by design.
- **Case-conversion layer** — forbidden; contract keys stay snake_case end to end.
- **Drafts in localStorage** — helps only people who leave and return; lowest impact per hour. Leaving the form drops answers. localStorage holds only applied job ids (D29).
- **Reorder by effort** — the prefill step already puts the easiest answers first; open questions keep the recruiter's config order.
- **Intro screen** — the step line ("Step X of Y") already sets expectations.
- **Numeric display formatting** — formatting while typing moves the cursor; would format on blur only.
- **SVG icons as files via svgr** — a few inline icons in `Icons.tsx` don't need a build plugin.
- **React Query** — job and profile are imported fixtures; there is nothing to fetch.
- **Profile editing** — the profile is a read-only fixture.
- **Quieter error announcements** — switching language re-announces the visible errors (each is a `role="alert"`); a minor screen-reader annoyance, not worth an announcement system here.
