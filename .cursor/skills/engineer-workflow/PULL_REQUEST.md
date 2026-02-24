# 🚀 Pull Request Best Practices (Agent Guidance)

Follow these practices whenever creating, updating, or describing a pull request so that reviewers and automation can evaluate changes quickly and consistently.

---

## 1. 🎯 One logical change per PR

- **Scope**: A single PR should implement one feature, fix one bug, or refactor one concern. Split large work into smaller PRs that can be reviewed and merged independently.
- **Branch**: Create the PR from a feature branch (e.g. `feat/short-name` or `fix/issue-123`), not directly from `main`/`master`. Keep the branch up to date with the base branch before requesting review.
- **Commits**: Prefer a clear commit history (e.g. one logical change per commit). Squashing is acceptable if the project prefers a single commit per PR; follow project norms.

---

## 2. 📝 PR title

- **Format**: Use imperative mood and, when it fits, conventional-commit style:
  - `feat(scope): add user profile endpoint`
  - `fix(auth): correct token expiry handling`
  - `docs: update API README`
  - `refactor(frontend): extract shared form hooks`
- **Length**: About 50–72 characters. Enough to understand the change at a glance.
- **No ticket IDs in title unless required**: Prefer a descriptive title; put issue/PRD references in the description.

---

## 3. 📄 PR description structure

Provide enough context so a reviewer can understand **what**, **why**, and **how to verify** without reading every line of code. Use this structure (adapt sections to what's relevant):

### ✨ Summary
- 1–3 sentences: what this PR does and why it exists.
- If it implements a spec or PRD, say so and link it (e.g. `Implements [PRD: Feature X](link)` or `Fixes #123`).

### 📋 What changed
- Bullet list of main changes (modules, endpoints, components, config).
- Call out any breaking changes or migration steps.

### 🧪 How to test / verify
- Steps to run the app and trigger the new or changed behavior.
- Any new or updated tests; how to run them (e.g. `pnpm test`, `uv run pytest`).
- Optional: link to a checklist (see below).

### 📸 Screenshots or artifacts (when useful)
- For UI changes: before/after or key states.
- For APIs: example request/response or curl.

### ✅ Checklist (self-review before requesting review)

- [ ] Code follows project style and lint/format rules.
- [ ] New behavior has tests (unit/integration as per project).
- [ ] Docs/README updated if behavior or setup changed.
- [ ] No secrets, credentials, or debug code left in.
- [ ] CI passes (or explain known failures).

---

## 4. 🔗 Linking work

- **Issues**: Use `Fixes #123` or `Closes #123` in the description so issues auto-close on merge (if the host supports it).
- **Specs/PRDs**: Reference the doc and section (e.g. `docs/prd-feature-x.md § Acceptance criteria`) so reviewers can check completeness.
- **Dependencies**: If this PR depends on another PR or branch, say so and link it.

---

## 5. 🟢 Review readiness

- **CI**: Ensure the branch passes CI (tests, lint, build). Fix or explain failures before asking for review.
- **Self-review**: Run the same checks locally (lint, tests, typecheck) and fix issues. Use the checklist above.
- **Size**: Prefer PRs that can be reviewed in one sitting. If the change is large, add a short "Review guide" (e.g. "Start with `app/api.py`, then `services/`") to help reviewers.

---

## 6. 🤖 When writing the description (agent workflow)

1. **Summarize the diff**: From `git diff main...HEAD` (or base branch), derive the "What changed" bullets and a one-line summary.
2. **Choose a title**: Imperative, conventional style, ~50–72 chars.
3. **Fill the template**: Summary, What changed, How to test, Checklist. Add screenshots/links only when you have them or the user provides them.
4. **Reference issues/PRDs**: If the user mentioned an issue or doc, include the link and "Fixes #…" or "Implements …" as appropriate.
5. **Do not push or open the PR** unless the user explicitly asks; you can output the title and description for the user to paste, or suggest they run `gh pr create` with the body.

---

## 📌 Summary for agents

- **One PR = one logical change**; use a feature branch and a clear commit history.
- **Title**: Imperative, conventional-commit style, ~50–72 chars.
- **Description**: Summary, What changed, How to test, Checklist; link issues/PRDs.
- **Review-ready**: CI green, self-review done, no secrets; optionally add a short review guide for large PRs.
- **Output**: Provide title + description for the user; only push or open the PR when the user asks.
