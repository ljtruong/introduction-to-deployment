---
name: engineer-workflow
description: End-to-end feature workflow: explore requirements, implement, branch from main, commit with create-git-commit, then push and open a PR using PULL_REQUEST.md. Use when the user wants to implement a feature, work through a task, or "do the full workflow" / "implement and open a PR".
---

# Engineer Workflow

Follow this workflow when implementing a feature or task from start to PR. Execute steps in order; use the linked skill and doc where indicated.

## 1. Explore requirements / tasks

- **Clarify scope**: What is the user asking for? If there is a PRD, issue, or spec, read it and extract acceptance criteria and scope (frontend vs backend).
- **Break down**: List concrete tasks (e.g. "add API endpoint X", "add form Y", "wire up Z"). Confirm with the user if the scope is unclear or large.
- **Order**: Decide implementation order (e.g. backend first if frontend depends on it).

## 2. Implement

- **Implement** the changes following project standards. Use **@backend-engineer** for `backend/` and **@frontend-engineer** for `frontend/` when relevant.
- Run lint and tests; fix failures before proceeding.

## 3. Create a branch from main

- Ensure `main` is up to date: `git fetch origin main` (or `master` if that is the default branch).
- Create and checkout a feature branch from main:
  - `git checkout main` then `git pull origin main` (or equivalent), then  
  - `git checkout -b feat/short-name` or `fix/short-name` (use a short, descriptive name).
- Request **git_write** for checkout/branch creation if needed.

## 4. Commit using the create-git-commit skill

- Use the **create-git-commit** skill to commit your changes:
  - Inspect changes (`git status`, `git diff`), stage the right files, write a conventional-commit message, and run `git commit`.
- Prefer one logical change per commit; split into multiple commits if the change mixes unrelated concerns.

## 5. Push and create a PR using PULL_REQUEST.md

- **Push** the branch: `git push -u origin <branch-name>`. Request **network** or **git_write** as required.
- **PR content**: Follow [PULL_REQUEST.md](.cursor/skills/engineer-workflow/PULL_REQUEST.md):
  - **Title**: Imperative, conventional-commit style, ~50–72 chars (e.g. `feat(api): add user profile endpoint`).
  - **Description**: Summary, What changed, How to test, Checklist; link any issue (e.g. `Fixes #123`) or PRD.
- **Open the PR**: Use the host’s CLI (e.g. `gh pr create --title "..." --body "..."`) or give the user the title and body to paste. Only run the create command if the user has asked to open the PR.
- Optionally ask the user if they want you to push and open the PR after committing.

## Summary

1. Explore requirements / tasks (clarify scope, break down, order).
2. Implement (follow project and agent standards; pass lint/tests).
3. Create a branch from main (`git checkout main && git pull && git checkout -b feat/...`).
4. Commit with **create-git-commit** (one logical change per commit).
5. Push branch, then create PR using **PULL_REQUEST.md** (title, description, optional `gh pr create`).
