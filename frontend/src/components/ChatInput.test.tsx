import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '@/components/ChatInput';

describe('ChatInput', () => {
  it('calls onSend with entered text when Send is clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    await user.type(input, 'Hello');
    await user.click(sendBtn);
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend when disabled', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled />);
    const input = screen.getByPlaceholderText('Type a message...');
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    await user.type(input, 'Hello');
    await user.click(sendBtn);
    expect(onSend).not.toHaveBeenCalled();
  });
});
