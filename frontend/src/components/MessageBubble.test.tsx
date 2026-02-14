import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageBubble } from './MessageBubble';

function uiMessage(role: 'user' | 'assistant', text: string) {
  return {
    id: `msg-${role}-${text}`,
    role,
    parts: [{ type: 'text' as const, text }],
  };
}

describe('MessageBubble', () => {
  it('renders user message with user styling', () => {
    render(<MessageBubble message={uiMessage('user', 'Hello')} />);
    const bubble = screen.getByText('Hello');
    expect(bubble).toBeInTheDocument();
    expect(bubble.closest('[data-role="user"]')).toBeInTheDocument();
  });

  it('renders assistant message with assistant styling', () => {
    render(<MessageBubble message={uiMessage('assistant', 'Hi there')} />);
    const bubble = screen.getByText('Hi there');
    expect(bubble).toBeInTheDocument();
    expect(bubble.closest('[data-role="assistant"]')).toBeInTheDocument();
  });
});
