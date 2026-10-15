# PRD — Instaffo Application Question Flow

## Problem

After clicking **Apply** on a job page, candidates must answer company-specific
pre-screening questions defined in recruiter-written JSON configs of uneven quality
(duplicate IDs, unknown types, misplaced rules). We need a flow that renders **any valid
job config**, collects and validates answers, evaluates screening rules, and emits the
**exact contract payload** — without ever crashing on a dirty config. Beyond correctness,
the business risk is **abandonment**: every extra minute and every confusing step loses
candidates. V1 solves correctness; V2 solves completion.

## Users

- **Candidate** — wants to apply fast and honestly: no re-typing what their profile
  already holds, no lost work, clear errors, their own language for the UI.
- **Company / recruiter** — wants structured, comparable answers plus an automatic
  screening verdict in the payload; their configs must work even when messy.
- **Platform developers (secondary)** — consume the payload; the contract (docs/task-contract.md) is the API.

## V1 scope — it just works

1. All 6 question types render via a type → component registry (no `switch` in the flow).
2. `normalizeJob()` per the contract + agreed policy: per-question `safeParse`, drop invalid
   first then dedupe IDs, drop broken options/rules, console warnings; an invalid job
   (no id / zero valid questions) shows an error state, never crashes.
3. Prefill from `profile_field` only when the value is valid for the question
   (input validation only — screening rules never gate prefill). Prefilled answers stay
   editable and are part of the payload.
4. Validation: required fields; integers within min/max parsed by a locale-independent
   grouping grammar (`85.000`, `85,000`, `85 000` → 85000; decimals rejected); date as
   `YYYY-MM-DD` via native input with `min` = today (local date parts); required boolean
   must be explicitly Yes or No; select respects `max_choices` (checkboxes disable at
   the cap); files PDF/DOCX/PNG/JPG ≤ 5 MB.
5. Payload exactly per contract: `value` vs `values` by `max_choices`, JSON types,
   plain base64 file data, optional unanswered questions omitted (incl. whitespace-only).
6. Screening: `must_be_at_least` (>=), `must_be_below` (strict <), `must_be_true`
   (evaluated only when configured `true`); missing answer fails the rule; screening
   never blocks submission.
7. On submit: payload as formatted JSON on screen + `console.log`.
8. UI in German and English (browser default → English fallback, persisted toggle);
   recruiter text always shown as written.
9. Questions in array order. Single-page form, no router.
10. Basic accessibility: label/input association, `aria-invalid`, `aria-describedby`.
11. Works for `short.json`, `long.json`, `bad.json`; one integration test per config.

## V2 scope — people finish it (proposed priorities)

| P  | Feature | Why this rank / trade-off |
|----|---------|---------------------------|
| P1 | Drafts in localStorage | Highest completion ROI — a reload currently destroys all answers. Trade-off: file answers excluded (quota); re-attach after restore. |
| P2 | Intro screen, honest effort ("N questions, about X min") | Sets expectations before investment; estimate derived from normalized config. Cheap. |
| P3 | Prefill summary card (confirm, don't re-ask) | Biggest perceived-effort cut on prefilled jobs. Trade-off: rubber-stamping stale data — card shows values, one tap to edit. |
| P4 | Progress indicator + optionals clearly marked/skippable | Reduces mid-form abandonment; pairs with the step/page decision. |
| P5 | Reorder by effort (quick/knockout first, text/file last) | Sunk-cost momentum; knockouts first means less wasted effort before a likely rejection. Trade-off: overrides recruiter order (the contract permits). |
| P6 | Screening result messaging | Generic wording only — never reveal thresholds, never block submission. |
| P7 | Mobile-first, keyboard nav, accessible error summary | Continuous quality bar; dedicated audit at the end. |

## Out of scope

- Real submission, backend, auth — the payload on screen is the deliverable.
- Recruiter config authoring/validation tooling (we only console-warn).
- Profile editing (profile is a read-only fixture).
- New question types (e.g. `rating` stays an ignored unknown type).
- Blocking candidates based on screening results.
- Analytics/tracking.
