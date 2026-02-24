# PRD: Chat Loading Experience Refinement

## 1. Title and summary

**Title:** Chat loading experience refinement — scroll-to-content and loading indicator

**Summary:** When a user sends a message in chat, the view should immediately adjust so the new user message and the loading state are visible (e.g. scroll to bottom). A loading icon or indicator must be visible for the full duration of the request (waiting for and streaming the assistant reply). This PRD defines the behavior and acceptance criteria so **@frontend-engineer** can implement it without ambiguity.

---

## 2. Problem and context

After submitting a message, users may not see their own message or the loading state because the scroll position does not update quickly or reliably. This leads to confusion (“Did my message send?”) and a sense that the app is unresponsive. The chat already has a message list, streaming, and a loading indicator; the gap is consistent “push up” behavior so the latest content (user message + loading) is in view.

---

## 3. Goals and non-goals

| | |
|---|---|
| **Goals** | When the user submits a message, the view scrolls or adjusts so the new user message and the loading indicator are visible. A loading icon/indicator is shown for the entire time the request is in progress (waiting for or streaming the assistant reply). |
| **Non-goals** | Changing the streaming API or backend contract; adding typing indicators or read receipts; changing message bubble layout or styling beyond what’s needed for visibility. |

---

## 4. User personas and user stories

- **Persona:** End user in the chat interface (e.g. learner or support user).

**User stories:**

- **US1 — See my message and that the app is working**  
  As a user, I want the page to scroll so that my new message and the loading indicator are visible right after I send, so that I know my message was sent and the app is responding.

- **US2 — See loading until the reply is done**  
  As a user, I want a clear loading icon or indicator while the assistant reply is being generated (both waiting and streaming), so that I know the app is still working and when it’s done.

---

## 5. Acceptance criteria

- **AC1 — Scroll on submit**  
  **Given** the user is in the chat view and may be scrolled up, **when** they submit a message (click Send or Enter), **then** the view scrolls or adjusts so that (1) the newly added user message is visible and (2) the loading indicator is visible (e.g. scroll to bottom so both are in view).

- **AC2 — Loading visible for full request**  
  **Given** the user has submitted a message, **when** the request is in progress (waiting for first token or streaming), **then** a loading icon or indicator is visible. **When** the request finishes (success or error), **then** the loading indicator is hidden.

- **AC3 — Scroll during streaming (optional but recommended)**  
  **Given** the assistant reply is streaming, **when** new content is appended, **then** the view may keep the latest content in view (e.g. stay at bottom or scroll to show new content) so the user can read as it streams, unless they have explicitly scrolled up to read earlier content.

- **AC4 — Verifiable**  
  All of the above can be verified manually (e.g. submit message from mid-scroll and confirm user message + loading are visible; confirm loading appears and then disappears). Automated tests may assert scroll position or presence of loading indicator when status is `submitted` or `streaming`.

---

## 6. Scope split: Frontend vs Backend

| Capability | Owner | What must be done |
|------------|--------|-------------------|
| Scroll / “push up” on submit | **@frontend-engineer** | On message submit, scroll or adjust the scroll container so the new user message and the loading indicator are in view (e.g. scroll to bottom). Use existing refs/scroll behavior (e.g. `messagesEndRef`, `scrollIntoView`) and ensure it runs at the right time (e.g. after the optimistic user message is in the list or immediately on submit). |
| Loading icon during request | **@frontend-engineer** | Show a loading icon or indicator whenever `status === 'submitted'` or `status === 'streaming'` (or equivalent from `useChat`). Ensure it is visible in the same scroll context as the message list (e.g. just above the input). Existing `LoadingIndicator` may be reused or replaced with an icon; it must be visible and accessible (e.g. `aria-busy`, `aria-label`). |
| Scroll during streaming | **@frontend-engineer** | Optionally keep scroll position in sync so the latest content stays in view while streaming (e.g. scroll to bottom when new content is appended, unless the user has scrolled up). |
| Backend | **@backend-engineer** | No API or behavior changes required for this feature. Existing `/chat/stream` and `useChat` statuses (`submitted`, `streaming`, `ready`, `error`) are sufficient. |

**Summary:** This is **frontend-only**. Backend only needs to be involved if product later decides to change streaming semantics or add new statuses.

---

## 7. Dependencies and implementation order

- **Dependencies:** Existing chat UI (e.g. `ChatView`, `MessageList`, `useChat`, `TextStreamChatTransport`), existing scroll refs and `ScrollArea`, and existing loading state from `useChat` (`status`).
- **Order:** (1) Ensure scroll-on-submit behavior (so user message + loading are visible). (2) Ensure loading indicator is visible for full request (already shown when `isLoading`; verify placement and visibility with scroll). (3) Optional: refine scroll-during-streaming (e.g. auto-scroll to bottom while streaming unless user has scrolled up).

---

## 8. Edge cases and error handling

| Scenario | Desired behavior |
|----------|-------------------|
| User submits from bottom | View already shows new message and loading; no jarring jump. Optional: small scroll to ensure loading indicator is visible if it’s below the fold. |
| User submits while scrolled up | View “pushes up” so the new user message and loading indicator are visible (e.g. scroll to bottom). |
| Very long user message | Message is in the list; scroll still targets “bottom” so the end of the message and the loading indicator are in view. |
| Slow network / long wait | Loading indicator remains visible until the first token arrives or the request errors. No change to backend timeout required for this PRD. |
| Request error | Loading indicator is hidden when status becomes `error`; existing error handling (e.g. banner or inline message) applies. User’s message may remain visible; scroll position unchanged unless product specifies otherwise. |
| Rapid successive submits | Disabled by existing “send disabled when not ready” behavior. Loading shows for the single in-flight request. |
| Empty or very short viewport | Scroll still attempts to show latest content; loading indicator remains visible. No backend change. |

---

## 9. Success metrics (optional)

- **Qualitative:** Users report that they can see their message and that the app is “loading” after send.
- **Manual QA:** In a checklist: “Submit message from mid-scroll → user message and loading indicator are visible”; “Loading appears when sending and disappears when reply completes or errors.”

---

## 10. Open questions / follow-ups

- **Loading indicator style:** Use existing bouncing-dots component or switch to a single spinner/icon? (Leave to **@frontend-engineer** and design; PRD only requires “a loading icon or indicator.”)
- **Scroll during streaming:** Auto-scroll to bottom on every stream chunk, or only when user is “at bottom” (e.g. within N pixels of bottom)? Current codebase has `isAtBottom`; can be used to avoid fighting user scroll.
- **Accessibility:** Ensure scroll-after-submit does not cause unexpected focus moves; keep focus in input or move to new content per product/accessibility preference.

---

*PRD for implementation by **@frontend-engineer**; see § Acceptance criteria and § Scope split. Backend changes not required unless otherwise specified.*
