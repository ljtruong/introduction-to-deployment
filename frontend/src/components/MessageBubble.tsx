import type { UIMessage } from 'ai';
import { MarkdownMessage } from './MarkdownMessage';

type MessageBubbleProps = {
  message: UIMessage;
};

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);
  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      data-role={message.role}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-muted text-foreground'
            : 'border border-border bg-background text-foreground'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm">{text}</p>
        ) : (
          <MarkdownMessage content={text} />
        )}
      </div>
    </div>
  );
}
