# instaffo-question-flow

Read order: this file → `docs/task-contract.md` → `DECISIONS.md`.
Authority: `docs/task-contract.md` (the contract) > `DECISIONS.md` > `CLAUDE.md` — the
higher wins; the lower is corrected in the same commit.

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck`

## Structure

```
src/
  data/                 # single import point: root fixtures (jobs/, profile.json) enter here
  domain/               # pure business logic, no React, fully tested
    schema.ts           # zod schemas (job, question types, profile)
    normalize.ts        # per-question safeParse: drop invalid → dedupe IDs → + warnings
    prefill.ts          # profile_field → initial answers (only if valid for the question)
    screening.ts        # evaluate rules → { passed, failed }
    payload.ts          # answers → exact contract payload
  components/
    atoms/              # Button, Input, Radio, Checkbox, ...
    molecules/          # Field (label + input + error), OptionGroup, FileDrop, ...
    questions/          # one component per question type + registry.ts
  hooks/                # useJobWizard: job id → job, prefilled answers, wizard steps
  routes.tsx            # URL → page (react-router); /de parent = German, / = English
  pages/
    JobOverviewPage.tsx # job info + Apply button (job switcher for the 3 configs)
    ApplyFlow.tsx       # the wizard, step in ?step=N
    SubmitConfirmation.tsx # confirmation after submit
  i18n/                 # en.ts, de.ts (UI text only)
  utils/                # generic helpers (fileToBase64, parseLocaleNumber)
  test/                 # test-only helpers (renderRoute: the app at a URL on a memory router)
```

## Naming conventions

| What                  | Style                         | Example                                      |
| :-------------------- | :---------------------------- | :------------------------------------------- |
| Folders               | lowercase / kebab-case        | `components/atoms`, `question-types`         |
| React component files | PascalCase (= component name) | `JobOverviewPage.tsx`, `NumericQuestion.tsx` |
| Other TS files        | camelCase                     | `screening.ts`, `fileToBase64.ts`            |
| Tests                 | next to the file, same name   | `screening.test.ts`                          |
| Variables / functions | camelCase                     | `buildPayload`, `questionId`                 |
| Types / components    | PascalCase                    | `NumericQuestion`, `AnswerPayload`           |
| Constants             | UPPER_SNAKE_CASE              | `MAX_FILE_SIZE_BYTES`                        |

**Import aliases:** `@/*` → `src/*`; fixtures via `@jobs/*` and `@profile`. Relative
imports only within the same folder.

**Contract keys stay snake_case.** Keys defined by the contract (`job_id`, `profile_field`,
`max_choices`, `must_be_below`, `content_type`, `file_name`, …) and enum values like
`3_months` are never renamed. No case-conversion layer. TS types for contract data use
the snake_case keys exactly.

## Rules that never change

- `domain/` is pure TypeScript — no React, no DOM, no side effects: logic stays testable without rendering.
- Every job config goes through `normalizeJob()` before use: raw configs lie.
- Adding a question type = new component + one registry entry: the flow never switches on type.
- Colors only by role (`text-error`, `bg-primary`); palette colors like `red-600` exist only inside `@theme`: design changes stay one-line.
- Raw styling lives in `atoms/` and `molecules/`; pages compose and add only layout classes (`flex`, `gap-4`, `grid`): the atom is the semantic layer.
- Don't abstract until code is duplicated three times, and no wrapper component that only forwards props: wrong abstractions cost more than duplication.
- Implement only what the current issue asks: scope creep hides review surface.
- The contract (`docs/task-contract.md`) is the source of truth; every rule in it has a test: untested contract rules rot.
- TypeScript strict, no `any`: the contract types are the safety net.
- Let TypeScript infer; annotate only where it checks something — contract shapes, discriminated results, empty containers, nullable state, `unknown` at trust boundaries: redundant annotations are noise that drifts.
- Prefer flat lookup tables with `satisfies` over generic helpers and conditional types: a reader sees the mapping, the compiler still checks coverage.

## Things that will bite you (each has at least one test)

1. **`value` vs `values`.** Shape depends on `max_choices` > 1, NOT on how many options were picked. One selected option in a multi-select is still `values: ["x"]`.
2. **Base64 prefix.** `readAsDataURL` returns `data:application/pdf;base64,...`. The payload needs plain base64 — strip the prefix.
3. **Dates shift with timezones.** Never use `toISOString()` for `YYYY-MM-DD`.
4. **`false` is an answer.** A required boolean has no default; unanswered ≠ false.
5. **Strict vs inclusive.** `must_be_below` is `<` (90000 fails), `must_be_at_least` is `>=`.
6. **Missing answer fails the rule** — matters for optional questions with rules.
7. **German numbers.** `85.000` means 85000, not 85. Integers only.
8. **Raw configs lie.** Duplicate IDs, unknown types and misplaced rules exist (bad.json). Never render a job config that hasn't gone through `normalizeJob()`.
9. **Contract keys are snake_case.** Never rename them (see naming conventions).
10. **Prefill only valid values.** A profile value that is not a valid option (or out of min/max) is not prefilled.

## Frozen

`jobs/*.json`, `profile.json` and the contract `docs/task-contract.md` are fixtures — never
edit them, not even to make a test pass. New test data goes into new files (e.g.
`jobs/edge-cases.json`).

## Working agreements

- A product decision is written to `DECISIONS.md` in the same commit as the code that implements it — never later.
- `DECISIONS.md` lists only decisions in force: a replaced decision is deleted, never marked "superseded" — git keeps the history.
- Comments are one line, next to the code they explain, and only state a *why* the code can't show: a browser quirk, a bite, a guard a reader would otherwise "fix". Markup, ARIA attributes and DECISIONS entries speak for themselves. JSDoc is one sentence on what the function does.
- Docs stay minimal: README covers usage only, one plain sentence per decision, no defensive code for cases the app needn't survive.
- Pushback comes first: when a request has a flaw, a risk or a simpler alternative, state it with reasons and wait for the user's decision before implementing. With no pushback, implement right away.
- For tasks with 3+ steps, keep a visible todo list.
- Every diff is read by a human: explain why a change is needed, not only what changed.
- Small commits, one issue each, with clear messages.
- Every PR must pass CI. Run `npm run typecheck && npm run lint && npm test` before committing.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `soheilaghayour/instaffo-question-flow`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
