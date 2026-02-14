import type { ChatResponse, Message, SessionResponse } from '../types/chat';

const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export function getApiBaseUrl(): string {
  return base;
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
