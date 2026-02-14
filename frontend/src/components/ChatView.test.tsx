import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatView } from './ChatView';
import * as chatApi from '@/api/chat';
import { useChatStore } from '@/store/chatStore';

vi.mock('@/api/chat', () => ({
  createSession: vi.fn(),
  getApiBaseUrl: () => '',
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

describe('ChatView', () => {
  beforeEach(() => {
    localStorage.clear();
    useChatStore.getState().setSessionId(null);
    vi.mocked(chatApi.createSession).mockResolvedValue({
      session_id: 'test-session-123',
    });
    vi.mocked(chatApi.getMessages).mockResolvedValue([]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Echo reply'));
        controller.close();
      },
    });
    globalThis.fetch = vi.fn((url: string | URL) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/chat/stream')) {
        return Promise.resolve(new Response(stream, { status: 200 }) as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as typeof fetch;
  });

  it('creates a session on mount', async () => {
    render(<ChatView />);
    await waitFor(() => {
      expect(chatApi.createSession).toHaveBeenCalledTimes(1);
    });
  });

  it('sends message and shows user and assistant messages after streamed reply', async () => {
    const user = userEvent.setup();
    render(<ChatView />);
    await waitFor(() => {
      expect(chatApi.createSession).toHaveBeenCalled();
    });
    const input = screen.getByPlaceholderText('Ask anything');
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    await user.type(input, 'Hello');
    await user.click(sendBtn);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    await waitFor(
      () => {
        expect(screen.getByText('Echo reply')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('restores previous messages when sessionId is in store (e.g. after refresh)', async () => {
    useChatStore.getState().setSessionId('restored-session');
    vi.mocked(chatApi.getMessages).mockResolvedValue([
      { role: 'user', content: 'Previous question' },
      { role: 'assistant', content: 'Previous answer' },
    ]);
    render(<ChatView />);
    await waitFor(() => {
      expect(screen.getByText('Previous question')).toBeInTheDocument();
    });
    expect(screen.getByText('Previous answer')).toBeInTheDocument();
  });
});
