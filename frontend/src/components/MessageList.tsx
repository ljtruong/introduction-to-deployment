import type { UIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';

type MessageListProps = {
  messages: UIMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </>
  );
}
