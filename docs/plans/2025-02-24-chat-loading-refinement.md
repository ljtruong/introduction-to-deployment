# Chat Loading Refinement — Implementation Plan

**Goal:** When the user submits a message, the view scrolls so the new user message and loading indicator are visible; a loading icon is shown for the full request (submitted + streaming).

**Source:** docs/prd-chat-loading-refinement.md (§ Acceptance criteria, § Scope split)

**Scope:** Frontend only. No backend changes.

---

## Task 1 (Frontend): Scroll to bottom on submit

**Acceptance:** AC1 — After submit, view shows new user message and loading indicator (e.g. scroll to bottom).

**Files:**
- Modify: `frontend/src/components/ChatView.tsx`

**Steps:**

1. **Trigger scroll when status becomes 'submitted'**  
   Add an effect that runs when `status === 'submitted'`: call scroll-to-bottom (e.g. `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })`). This ensures that as soon as the user message is in the list and loading is shown, the view has scrolled so both are visible.

2. **Optional: scroll immediately in handleSubmit**  
   After `sendMessage(...)`, schedule a scroll (e.g. `setTimeout(() => scrollToBottom(), 0)` or `requestAnimationFrame`) so the view updates even if the optimistic user message is not yet in the list. Ensures "push up" feels immediate.

3. **Reuse existing scroll helper**  
   Use the existing `scrollToBottom` / `messagesEndRef` and `ScrollArea` structure; no new refs required.

**Verify:** Submit a message while scrolled up; confirm the view scrolls so the new user message and the loading indicator (below the message list) are visible.

---

## Task 2 (Frontend): Loading indicator visible for full request

**Acceptance:** AC2 — Loading icon visible while request is in progress (submitted or streaming); hidden when ready or error.

**Files:**
- Read/verify: `frontend/src/components/ChatView.tsx` (where `isLoading` and `LoadingIndicator` are used)
- Optionally modify: `frontend/src/components/LoadingIndicator.tsx` (style only if desired; PRD allows existing component)

**Steps:**

1. **Confirm loading is shown for full request**  
   In `ChatView`, `isLoading = status === 'submitted' || status === 'streaming'` is already correct. Ensure the loading row (the div that wraps `LoadingIndicator`) is always visible when `isLoading` — it is currently in the layout between the scroll area and the form. No change needed unless the indicator is off-screen on small viewports.

2. **Ensure accessibility**  
   `LoadingIndicator` already has `aria-busy="true"` and `aria-label="Waiting for reply"`. Confirm they are present and correct.

**Verify:** Send a message; confirm the loading indicator appears and stays until the reply finishes or errors.

---

## Task 3 (Frontend): Scroll during streaming — only when user at bottom

**Acceptance:** AC3 (optional) — While streaming, keep latest content in view if the user hasn’t scrolled up.

**Files:**
- Modify: `frontend/src/components/ChatView.tsx`

**Steps:**

1. **Scroll to bottom only when appropriate**  
   The current effect that runs on `messages` change always scrolls to bottom. Change it so we only scroll when: (a) user is already at bottom (`isAtBottom`), or (b) we are in loading state (`status === 'submitted' || status === 'streaming'`) so the first scroll after submit still happens. This avoids fighting the user when they scroll up to read.

2. **Implementation**  
   In the effect that does `messagesEndRef.current?.scrollIntoView(...)` on `[messages]`, add a condition: only scroll if `isAtBottom || status === 'submitted' || status === 'streaming'`. Ensure `status` and `isAtBottom` are in the dependency array if used.

**Verify:** Send a message, let it stream; scroll up mid-stream; confirm new content doesn’t force scroll. When at bottom, new content keeps the view at bottom.

---

## Task 4 (Frontend): Tests for loading and scroll behavior

**Acceptance:** AC4 — Behavior verifiable manually; automated tests for loading indicator presence by status and optional scroll.

**Files:**
- Modify or create: `frontend/src/components/ChatView.test.tsx`

**Steps:**

1. **Loading indicator visibility**  
   - When `status` is `'submitted'` or `'streaming'`, the loading indicator (e.g. element with `aria-busy="true"` or `aria-label="Waiting for reply"`) is in the document.  
   - When `status` is `'ready'` or `'error'`, that indicator is not present (or not visible).

2. **Mock useChat**  
   Use the existing test setup; mock `useChat` to return different `status` values and assert presence/absence of the loading indicator.

3. **Optional: scroll on submit**  
   If the test environment supports it, assert that after submitting, a scroll target (e.g. `messagesEndRef` or the bottom of the scroll container) is scrolled into view, or that the loading indicator is visible. If not feasible (e.g. JSDOM scroll limitations), document manual verification for AC1.

**Verify:** Run `pnpm test` (or `pnpm test:run`) and ensure ChatView tests pass.

---

## Implementation order

1. Task 1 — Scroll on submit (core “push up” behavior).
2. Task 2 — Confirm loading visibility (likely no code change).
3. Task 3 — Refine scroll-during-streaming (optional).
4. Task 4 — Add/update tests.

After each task, run `pnpm test` and fix any failures before proceeding.
