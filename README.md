# question-flow

[![CI](https://github.com/soheilaghayour/question-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/soheilaghayour/question-flow/actions/workflows/ci.yml)

A candidate-facing application question flow: it loads a job config,
renders the questions (text, date, boolean, numeric, select, file), prefills answers from
the candidate profile, evaluates screening rules, and produces the exact answer payload
defined by the task contract.

Built with React 19, TypeScript (strict), Vite, Tailwind, Vitest + Testing Library.

## Running it

```sh
npm install
npm run dev        # start the app (pick one of the three job configs on the job page)
npm test           # run the test suite
npm run lint       # eslint
npm run typecheck  # tsc -b
npm run build      # typecheck + production build
```

## Where things live

- [`docs/task-contract.md`](docs/task-contract.md) — the task contract (frozen fixture):
  job config format, question types, screening rules, payload shape. The source of truth;
  every rule in it has a test.
- [`DECISIONS.md`](DECISIONS.md) — every judgment call the contract left open, with its
  reason. Includes rejected approaches and open PM questions.
- [`CLAUDE.md`](CLAUDE.md) — project structure, naming conventions, and the working
  agreements under which this repo is built.
- `jobs/*.json`, `profile.json` — mock data fixtures (frozen, including the deliberately
  broken `bad.json`).

## How it works, in one paragraph

Raw job configs are never trusted: everything passes through `normalizeJob()`
(`src/domain/`), which drops invalid questions, dedupes IDs, and strips misplaced rules —
with warnings. The domain layer (schemas, prefill, screening, payload) is pure TypeScript
with no React, fully unit-tested. Components follow atoms → molecules → question
components, where each question type is one component plus one registry entry; the flow
never switches on question type. Submitting builds the contract payload and shows it
on screen (and in the console).
