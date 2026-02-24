---
name: collaborate-workflow
description: Multi-agent feature workflow: product manager writes PRD, plan splits frontend/backend tasks, engineers implement via subagents, then review for completeness. Use when building a feature with PM + frontend + backend, "full collaboration", or "PRD then implement with engineers".
---

# Collaborate Workflow

Orchestrate a feature from requirements to implementation using the **product-manager**, **frontend-engineer**, and **backend-engineer** agents. Execute phases in order; use subagents where indicated.

## When to use

- User asks to "break down requirements and implement with frontend and backend"
- User wants a PRD first, then implementation by role
- Feature spans frontend and backend and should be specified before coding

## Phase 1: Requirements and PRD (Product Manager)

**Agent:** Use **product-manager** (e.g. `mcp_task` with `subagent_type: product-manager` or @product-manager).

1. **Clarify the ask** — What problem or feature? Who is it for? Any constraints?
2. **Break down requirements** — User stories, acceptance criteria, scope (in/out).
3. **Write the PRD** — Save to `docs/prd-<feature-name>.md` (or `docs/plans/YYYY-MM-DD-<topic>-design.md` if coming from brainstorming).
4. **Scope split** — For each capability, label **Frontend**, **Backend**, or **Both** and what each side must do.
5. **Dependencies and order** — Which work blocks which (e.g. backend API first, then frontend).

**PRD must include:** Title/summary, problem and context, goals and non-goals, user stories, **acceptance criteria** (testable), **scope split (Frontend vs Backend)**, dependencies/order, edge cases and errors.

**Checklist before leaving Phase 1:**
- [ ] PRD is in `docs/`
- [ ] Acceptance criteria are testable (Given/When/Then or clear bullets)
- [ ] Scope split explicitly names frontend vs backend tasks
- [ ] Implementation order is stated

---

## Phase 2: Implementation plan from PRD

**Owner:** Main agent (or product-manager if preferred).

1. **Read the PRD** — Especially acceptance criteria and scope split.
2. **Create the implementation plan** — Save to `docs/plans/YYYY-MM-DD-<feature-name>.md`.
3. **Split tasks by role:**
   - **Backend tasks** — API, data, validation, streaming, etc. One or more bite-sized tasks (2–5 min each where possible).
   - **Frontend tasks** — UI, hooks, API calls, tests. Same granularity.
4. **Respect dependencies** — Order tasks so backend work that frontend needs comes first (or mark "Frontend: mock until backend ready").
5. **Per task include:** Files to create/modify, steps (e.g. test first, implement, run tests, commit), exact paths and commands.

**Plan header (required):**
```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence from PRD]
**Source:** docs/prd-<feature-name>.md (§ Acceptance criteria, § Scope split)

---
```

**Checklist before leaving Phase 2:**
- [ ] Plan lives in `docs/plans/`
- [ ] Every PRD acceptance criterion is covered by at least one task
- [ ] Tasks are labeled Backend or Frontend (or "Both" with sub-tasks)
- [ ] Implementation order and dependencies are clear

---

## Phase 3: Implement with frontend and backend engineers

**Agents:** Use **frontend-engineer** and **backend-engineer** subagents (e.g. `mcp_task` with `subagent_type: frontend-engineer` or `backend-engineer`).

1. **Assign tasks from the plan** — Backend tasks → backend-engineer; frontend tasks → frontend-engineer.
2. **Run in dependency order** — Backend first when frontend depends on API; frontend can start with mocks if needed.
3. **One subagent per task or per logical group** — Pass the plan file path and the specific task(s); ask for implementation and tests.
4. **After each task (or batch):** Run lint and tests for the affected area (`pnpm test` / `uv run pytest`), then proceed.

**Handoff to subagent example:**
- "Implement Task N from docs/plans/YYYY-MM-DD-feature.md: [paste task]. Follow project standards and add/update tests. Return when done and report any blockers."

**Checklist during Phase 3:**
- [ ] Backend tasks implemented with tests (pytest)
- [ ] Frontend tasks implemented with tests (Vitest/RTL)
- [ ] Lint and tests pass for changed code
- [ ] No unaddressed blockers from engineers

---

## Phase 4: Review for completeness

**Owner:** Main agent; optionally use **code-reviewer** for a final pass.

1. **PRD vs implementation** — For each acceptance criterion in the PRD, confirm it is met by the current code or tests.
2. **Plan vs done** — Every task in the implementation plan is either done or explicitly deferred with a reason.
3. **Edge cases and errors** — Behaviors described in the PRD (errors, empty states, timeouts) are implemented or documented as follow-up.
4. **Quality** — Lint and full test suite pass; no known regressions.

**Checklist:**
- [ ] All PRD acceptance criteria satisfied or explicitly scoped out
- [ ] All plan tasks completed or deferred with reason
- [ ] Edge cases and error handling from PRD addressed
- [ ] `pnpm test` and `uv run pytest` pass (or equivalent)

---

## Phase 5: Finish (branch, commit, PR)

If the user wants a branch and PR:

1. **Create branch from main** — `git checkout main && git pull && git checkout -b feat/<short-name>`.
2. **Commit** — Use **create-git-commit** skill; one logical change per commit where possible.
3. **Push and open PR** — Follow **engineer-workflow** and [PULL_REQUEST.md](.cursor/skills/engineer-workflow/PULL_REQUEST.md): title, description (summary, what changed, how to test), link to PRD and plan.

---

## Summary

| Phase | Who / What | Output |
|-------|------------|--------|
| 1 | Product Manager | PRD in `docs/` with scope split and acceptance criteria |
| 2 | Main agent | Implementation plan in `docs/plans/` with frontend/backend tasks |
| 3 | Frontend + Backend engineers (subagents) | Code and tests; lint/tests pass |
| 4 | Main agent (+ optional code-reviewer) | Verification that PRD and plan are complete |
| 5 | Main agent | Branch, commits, PR (if requested) |

## Related skills and agents

- **PRD structure:** @product-manager (`.cursor/agents/product-manager.mdc`)
- **Plan format and task granularity:** writing-plans (bite-sized tasks, exact paths)
- **Implementation and PR:** engineer-workflow, create-git-commit, PULL_REQUEST.md
- **Review:** requesting-code-review, code-reviewer subagent
- **Verification:** verification-before-completion (assert only after running commands)
