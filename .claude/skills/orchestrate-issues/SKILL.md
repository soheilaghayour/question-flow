---
name: orchestrate-issues
description: Orchestrate the open GitHub issues from ready to merged through agents (implement, review, fix, simplify, human merge), with a run log and retros. Use when asked to orchestrate, work through or implement the open issues.
---

You are the **orchestrator**. You plan, brief, decide and log. Agents do every write to the product: code, docs, branches, pushes, PRs, issue and PR comments. Your only own write is the run log, `log.md` next to this file.

Each issue is one **cycle**. A cycle is done when the human has merged its PR and GitHub has closed the issue. You never merge.

## 1. Read the board

- `gh issue list --state open --json number,title,labels,body` and `gh pr list --state open`.
- For each open PR, read the human's review comments: `gh api repos/{owner}/{repo}/pulls/<n>/comments` and `gh pr view <n> --comments`. A comment without a reply is open work.
- An issue whose body says `Blocked by: #N` is blocked until #N is merged.

Done when every open issue and PR is sorted into exactly one queue:

| Queue | What it holds | What runs |
| :-- | :-- | :-- |
| feedback | PR with unanswered human comments | fix agent (step 5) |
| agent | `ready-for-agent`, unblocked | implement agent (step 3) |
| human | `ready-for-human`, unblocked, no prepared branch yet | prep agent (step 3, prep variant) |
| waiting | PR waiting for the human, blocked issue, `needs-triage`, `needs-info` | nothing; list it for the human |

Work the feedback queue first, then the agent queue in issue order, then the human queue.

## 2. Pick and plan

- **Parallel or serial.** Run two issues at the same time only if their file sets don't overlap. `DECISIONS.md`, `CLAUDE.md`, `README.md` and `PRD.md` count as files: two issues that both edit one of them run one after the other.
- **Model per role.** The model follows the kind of work, not how big the issue is:

| Role | Model | When |
| :-- | :-- | :-- |
| implement | `opus` | the issue leaves a judgment call open: a DECISIONS entry it doesn't spell out, a choice between approaches, an open question |
| implement | `sonnet` | the issue spells out what to build and what to write to the docs |
| prep (ready-for-human) | `sonnet` | always |
| review | `opus` | always: the review is the quality check |
| fix, simplify | `sonnet` | always |

Write the choice and its reason into the log before you launch.

## 3. Implement

Launch an Agent with `isolation: "worktree"`, the model from step 2 and a brief that holds:

- The issue number and how to read it: `gh issue view <n> --comments`.
- Read order: `CLAUDE.md` → `docs/task-contract.md` → `DECISIONS.md`. These win over the brief.
- Branch `<type>/<n>-<slug>` (`feat`, `fix`, `refactor`, `docs`, `chore`), test-first with the `tdd` skill, small commits.
- `npm run typecheck && npm run lint && npm test` green, then push and open a PR with `Closes #<n>`, written with the `pr` skill.
- Report back: PR URL, every judgment call it made and why, anything in the issue it found unclear.

**Prep variant** (ready-for-human): the brief follows the issue's PRD section "Working on a ready-for-human issue": branch `feat/<n>-<slug>` with stub files that throw `new Error('not implemented')`, the failing tests from the acceptance criteria, and the "Prepared for you" boilerplate. Push, no PR. Then tell the human the branch is ready; the cycle waits for their PR.

Done when the agent's report has a PR URL (or a pushed prep branch) and CI on it is green: `gh pr checks <n>`.

## 4. Review

Launch a **fresh** review agent (`opus`, no worktree). Give it the PR number and the issue number, never the implementer's summary, so the review is not anchored. It runs the `code-review` skill (standards + spec) on the PR's diff against `main` and reports findings to you. It posts nothing.

Then **triage** every finding yourself: *accept* (it breaks the contract, `CLAUDE.md`, `DECISIONS.md` or the issue) or *reject* with a one-line reason. Done when every finding has a verdict in the log.

## 5. Fix

Launch a `sonnet` agent on the PR branch with the accepted findings, or the human's unanswered comments. Human comments are labeled: `blocking:` is fixed test-first, `suggestion:` is applied or answered with a reason, `question:` is answered in a reply, `nit:` is applied if trivial. A finding about behavior gets a regression test. The agent pushes and replies to each human comment.

Done when every accepted finding and every human comment has a commit or a reply, and CI is green.

## 6. Simplify

Launch a `sonnet` agent on the PR branch that runs the `simplify` skill. It keeps behavior unchanged, keeps the checks green, and pushes.

Done when the agent reports what it changed (or that nothing needed changing) and CI is green.

## 7. Hand off

Tell the human: the PR link, what to read in it (the issue's "What to read in the PR" section if it has one), and the judgment calls the agents made. The cycle now waits for the human's review and merge. New human comments put the PR back in the feedback queue.

## 8. Log

After every step, append to `log.md`. One section per cycle:

```
## #<n> <title>
- class: agent | human | feedback · model: <role=model, …> · why: <one line>
- review findings: <total> (accepted <a>, rejected <r>)
- CI green on first push: yes | no
- human comments: blocking <b>, suggestion <s>, question <q>, nit <t>
- fix rounds until merge: <k>
- opened → merged: <timestamps from gh>
- worked: <one line> · failed: <one line>
```

Write only what you observed. A field you couldn't measure stays empty.

## 9. Retro

After every third merged cycle, read the last three log sections and write a **retro** to `log.md`: what repeated in "worked" and "failed", and **one** proposed change to this skill, tied to the log lines it comes from. Ask the human. If they approve, an agent edits this file, and the retro records the change, so later cycles show its effect. One change per retro, so each effect can be traced to its cause.

## Loop

Run under `/loop /orchestrate-issues`. When all work is in the waiting queue, schedule the next wake in 30 minutes to check for merges and new comments. Stop when the agent, human and feedback queues are empty and every open PR is merged.
