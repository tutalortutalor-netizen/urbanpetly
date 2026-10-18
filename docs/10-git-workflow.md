# 10 - Git Workflow and Review Policy

This policy applies to every contributor, human or agent. It is mandatory.

## Rules
1. **Nobody commits or pushes directly to `main`.** No exceptions, no force-pushes, no merging your own PR.
2. Every change is made on a **feature branch** created from the latest `main`.
3. Every feature branch is delivered through a **review issue** (and a Pull Request where available) targeting `main`.
4. Review chain: **the Tech Lead reviews and merges** (delegated by the founder). The Tech Lead's own work is reviewed by Full Stack Developer 1 and then merged by the Tech Lead. Authors never merge their own work.
5. Nobody bypasses checks (`--no-verify`, force pushes, admin overrides are forbidden).
6. Merge requires: checks pass (lint, typecheck, tests, build) and the Definition of Done in 07-test-plan.md. Until then the author's issue stays `in_review`.
7. The Tech Lead escalates to the founder (issue `blocked`) for scope or spec changes, security-sensitive changes (auth, OTP, payments, personal data), destructive DB migrations, and anything uncertain.

## Branch naming
`<type>/<story-id>-<short-slug>` e.g. `feat/E2-S3-near-me-search`, `fix/E4-S3-accept-race`, `chore/E12-S1-monorepo-scaffold`, `docs/adr-prerender`.
Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

## Commits
Conventional Commits (`feat(api): add provider search`). Small, focused commits; no secrets; no generated files unless the repo tracks them.

## Pull request requirements
- Title: `[<story-id>] short description`.
- Use the PR template (`.github/pull_request_template.md`): what changed, why, how to test, screenshots for UI, migration notes, risks, checklist.
- One story per PR; aim for under ~400 changed lines. Split large work.
- Link the Paperclip issue identifier in the description.
- Draft PR while work is in progress; mark ready for review when CI is green and the checklist is complete.

## Review flow
1. Author pushes the feature branch, comments test results, creates a child issue `Review and merge: <issue> <branch>` assigned to the Tech Lead (branch, story ID, what changed, how to verify, compare link), and sets their own issue to `in_review`.
2. Tech Lead reviews (architecture, correctness, tests, security, migrations) and runs install, lint, typecheck, tests and build in a clean checkout. Failing or incomplete work goes back to the author with precise change requests.
3. When it passes, the Tech Lead merges into `main` with a merge commit (`git merge --no-ff`, so GitHub marks the PR as merged) and pushes. Never force-push.
4. The Tech Lead comments a merge summary (commit SHA, changes, risks) and marks the review issue and the author's issue `done`.

## Branch protection (configured by the founder in GitHub)
`main`: block force pushes and deletions. Do not require pull requests or approvals while the Tech Lead merges with the founder's saved credentials (a rule requiring them would reject the merge push). Once a separate bot account exists for agents, tighten this: require a pull request, 1+ approval, passing status checks, and include administrators.

## Secrets
Never commit `.env` files, tokens, keys or OTP/SMS credentials. Only `.env.example` with placeholders.
