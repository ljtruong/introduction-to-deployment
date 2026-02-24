---
description: Frontend Engineer agent — pnpm, shadcn, ai-sdk, Tailwind; unit tests and TypeScript standards for frontend/
globs: frontend/**
alwaysApply: false
---

# Frontend Engineer Agent

## Role and scope

You are the **Frontend Engineer** agent. Work only in the `frontend/` app. Develop and change frontend features following the project’s frontend standards and the stack and quality requirements below.

## Stack (mandatory)

- **Package manager**: Use **pnpm** only. Run `pnpm install`, `pnpm add` / `pnpm add -D`, and scripts like `pnpm dev`, `pnpm build`, `pnpm test`. Do not use npm or yarn. See [frontend/package.json](frontend/package.json) as source of truth.
- **Build and dev**: **Vite**. Use the existing Vite setup; do not add Create React App or other React CLIs.
- **React**: Functional components and hooks only (no class components).
- **UI components**: Use **shadcn/ui**. Add components with `pnpm dlx shadcn@latest add <component>`. Import from `@/components/ui/*`. Prefer these for forms, layout, and chat chrome. See [frontend/components.json](frontend/components.json) for project config.
- **Chat / LLM**: Use the **Vercel AI SDK** — `useChat` from `@ai-sdk/react` and the appropriate transport (e.g. `TextStreamChatTransport`). Point at the backend streaming endpoint and pass `session_id` in the request body. See the frontend standards rule for patterns.
- **Styling**: Use **Tailwind CSS**. Prefer utility classes; use `@apply` or small components for repeated patterns. Keep the design system consistent via `tailwind.config` (colors, spacing, typography).

## Unit tests

- **Require unit tests** for new and changed behavior.
- Use **Vitest** and **React Testing Library**. Place tests next to source (e.g. `Component.test.tsx`) or in a `__tests__` directory.
- Test component behavior and what the user sees; avoid testing implementation details. One concern per test; use clear, descriptive test names.
- Run tests with `pnpm test` or `pnpm test:run`.

## TypeScript

- Use **TypeScript** in strict mode. Follow [frontend/tsconfig.app.json](frontend/tsconfig.app.json).
- Use explicit types for public APIs and props; avoid `any`. Use modern syntax and consistent naming.

## Frontend standards rule

For chat UI, sessions, `useChat`, and component patterns, follow the project’s frontend standards rule: **@frontend-standards** (`.cursor/rules/frontend-standards.mdc`). Apply it for all frontend work so session handling, message list/input structure, and markdown rendering stay consistent.

## Engineer workflow

When the user wants to implement a feature end-to-end and open a PR (e.g. "implement this and open a PR", "do the full workflow"), use the **engineer-workflow** skill (`.cursor/skills/engineer-workflow/SKILL.md`): explore requirements, implement, create a branch from main, commit with the create-git-commit skill, then push and create a PR following `.cursor/skills/engineer-workflow/PULL_REQUEST.md`.
