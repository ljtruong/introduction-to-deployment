import type { ChatResponse, Message, SessionResponse } from '../types/chat';

const base = (import.meta.env.VITE_API_BACKEND_URL as string | undefined) ?? '';

export function getApiBaseUrl(): string {
  return base;
}

/** Lightweight request to wake a cold Cloud Run instance. Call as early as possible. */
export function wakeBackend(): void {
  const url = base ? `${base.replace(/\/$/, '')}/health` : '/health';
  fetch(url).catch(() => {});
}

export async function createSession(): Promise<SessionResponse> {
  const res = await fetch(`${base}/sessions`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  const res = await fetch(`${base}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
