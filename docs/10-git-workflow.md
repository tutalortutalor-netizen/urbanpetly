# 10 - Git Workflow and Review Policy

This policy applies to every contributor, human or agent. It is mandatory.

## Rules
1. **Nobody commits or pushes directly to `main`.** No exceptions, no force-pushes, no merging your own PR.
2. Every change is made on a **feature branch** created from the latest `main`.
3. Every feature branch is delivered as a **Pull Request** to `main`.
4. Review chain: **Tech Lead reviews first, then the founder reviews and approves.** Only the founder merges.
5. Agents never merge, never approve their own PR, and never bypass checks (`--no-verify`, force pushes, admin overrides are forbidden).
6. A PR needs: passing CI, Tech Lead approval, founder approval. Until then the issue stays `in_review`.

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
1. Author marks the PR ready and moves the Paperclip issue to `in_review`, assigning the Tech Lead.
2. Tech Lead reviews (architecture, correctness, tests, security, migrations). Requests changes or approves and then asks the founder for review.
3. Founder reviews and approves; founder merges (squash merge).
4. After merge the author moves the issue to `done`.

## Branch protection (configured by the founder in GitHub)
`main`: require a pull request, require 1+ approval (CODEOWNERS review required), dismiss stale approvals on new commits, require status checks (CI) to pass, require linear history, block force pushes and deletions, **include administrators**. Agents use credentials that cannot bypass these rules.

## Secrets
Never commit `.env` files, tokens, keys or OTP/SMS credentials. Only `.env.example` with placeholders.
