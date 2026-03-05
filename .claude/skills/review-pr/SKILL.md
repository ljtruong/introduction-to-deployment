# Review PR (Project-Specific)

Review pull requests for the **introduction-to-deployment** repo using the project's PR expectations and code standards. Apply when the user asks to review a PR or "review this PR".

## What to use

- **PR format and description:** [PULL_REQUEST.md](.cursor/skills/engineer-workflow/PULL_REQUEST.md) — title, summary, what changed, how to test, checklist.
- **Frontend changes (`frontend/`):** [frontend-standards](.cursor/rules/frontend-standards.mdc) — pnpm, Vite, React, TypeScript, Tailwind, shadcn/ui, AI SDK useChat, Vitest/RTL, no npm/yarn.
- **Backend changes (`backend/`):** [python-standards](.cursor/rules/python-standards.mdc) — uv, FastAPI, PEP 8/257/484, Ruff, pytest, DRY/SOLID.

## Review steps

1. **Get the diff** — If a branch or PR is given, run `git fetch origin` then `git diff origin/main...<branch>` (or `gh pr diff <number>` if using GitHub CLI) to see the changes.
2. **PR description (when applicable)** — If the PR has a description, check: imperative conventional title (~50–72 chars), summary, "What changed", "How to test", and that any linked PRD/issue is referenced.
3. **Frontend (`frontend/`)** — For changed or new frontend code: pnpm (not npm/yarn), functional components/hooks, TypeScript strict, Tailwind + shadcn, useChat + session_id for chat, unit tests (Vitest/RTL) for new or changed behavior. Run `cd frontend && pnpm test -- --run` (and lint if available) to confirm tests pass.
4. **Backend (`backend/`)** — For changed or new backend code: uv (not pip), FastAPI patterns, type hints, Ruff style, pytest tests in `tests/`. Run `cd backend && uv run pytest` (and lint) to confirm tests pass.
5. **Cross-cutting** — One logical change per PR; no secrets or debug code; docs/README updated if behavior or setup changed.

## Feedback format

Structure feedback so the author can act on it:

- **Critical** — Must fix before merge (e.g. broken tests, wrong tooling, security, missing PRD link when one exists).
- **Suggestion** — Should consider (e.g. style, clarity, alignment with project standards).
- **Nice to have** — Optional improvement (e.g. extra test, doc tweak).

**Always close with a clear verdict:** If there are Critical or Suggestion items, end with a **Summary** (request changes / approve with minor comments) and list blocking items. If there is nothing to report, say **"LGTM"** (Looks Good To Me) and optionally one line (e.g. "LGTM — matches PRD and standards; tests pass.").

## Verification

Before concluding the review, run the relevant test commands and report pass/fail:

- Frontend: `cd frontend && pnpm test -- --run`
- Backend: `cd backend && uv run pytest`

If the PR touches both, run both and mention results in the summary.

## Post review to GitHub

**After writing the review**, post it as a comment on the GitHub PR so it appears in the PR conversation:

1. **Resolve the PR number** — From current branch: `gh pr view --json number -q .number`. If the user specified a PR (e.g. "review PR 3"), use that number.
2. **Post the review** — Use GitHub CLI to submit the **full review text** (the same content you output in chat) as the PR review body:
   - **LGTM / approve:** `gh pr review <number> --approve --body "LGTM — ..."` (or full review text).
   - **Request changes:** `gh pr review <number> --request-changes --body "<full review text>"`.
   - **Comment only:** `gh pr review <number> --comment --body "<full review text>"`.
3. **Multiline body** — For a long review with line breaks, write the review to a file (e.g. `review-pr-comment.md`), then: `gh pr review <number> --approve --body-file review-pr-comment.md` (or `--request-changes` / `--comment` with `--body-file`). Remove the file after posting if temporary.
4. **If `gh` fails** (not authenticated, no network) — Still output the full review in chat and suggest the user paste it on the PR or run `gh pr review` themselves.

Use `--approve` when LGTM, `--request-changes` when there are Critical or blocking Suggestions; otherwise `--comment`.

## Example summary

**When there are issues:**
```text
**Summary:** Request changes — 1 critical, 2 suggestions.

- **Critical:** Frontend uses `npm install` in a script; project uses pnpm (see frontend-standards).
- **Suggestion:** Add a test for the new loading state in ChatView (AC4 in prd-chat-loading-refinement).
- **Nice to have:** PR description could link to docs/prd-chat-loading-refinement.md § Acceptance criteria.

Tests: frontend 11 passed; backend 5 passed.
```

**When there are no issues:** End with:
```text
LGTM — matches PRD and standards; tests pass.
```
(or simply **LGTM**)
