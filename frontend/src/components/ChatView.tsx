import type { UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createSession, getApiBaseUrl, getMessages } from '@/api/chat';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { LoadingIndicator } from './LoadingIndicator';
import { MessageList } from './MessageList';

function messagesToUIMessages(msgs: Message[]): UIMessage[] {
  return msgs.map((m) => ({
    id: crypto.randomUUID(),
    role: m.role,
    parts: [{ type: 'text' as const, text: m.content }],
  }));
}

const pendingId = `pending-${crypto.randomUUID()}`;

export function ChatView() {
  const sessionId = useChatStore((s) => s.sessionId);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const [input, setInput] = useState('');
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef(false);
  const hydratedSessionRef = useRef<string | null>(null);

  const { messages, sendMessage, setMessages, status } = useChat({
    id: sessionId ?? pendingId,
    transport: new TextStreamChatTransport({
      api: `${getApiBaseUrl()}/chat/stream`,
    }),
  });

  useEffect(() => {
    if (sessionId !== null) return;
    createSession()
      .then((data) => {
        setSessionId(data.session_id);
        setBackendConnected(true);
      })
      .catch(() => setBackendConnected(false));
  }, [sessionId, setSessionId]);

  useEffect(() => {
    if (!sessionId || !setMessages || hydratedSessionRef.current === sessionId)
      return;
    hydratedSessionRef.current = sessionId;
    getMessages(sessionId)
      .then((msgs) => {
        if (msgs.length > 0) setMessages(messagesToUIMessages(msgs));
      })
      .catch(() => {
        hydratedSessionRef.current = null;
      });
  }, [sessionId, setMessages]);

  useEffect(() => {
    if (status === 'error') setBackendConnected(false);
  }, [status]);

  useEffect(() => {
    if (status === 'ready' && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      textareaRef.current?.focus();
    }
  }, [status]);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status]);

  useEffect(() => {
    if (!(isAtBottom || status === 'submitted' || status === 'streaming')) return;
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    setIsAtBottom(true);
  }, [messages, status, isAtBottom]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    const viewport = container?.parentElement;
    if (!viewport) return;
    const threshold = 24;
    const checkAtBottom = () => {
      const { scrollHeight, scrollTop, clientHeight } = viewport;
      if (scrollHeight <= 0) return;
      const atBottom =
        scrollHeight - scrollTop - clientHeight <= threshold;
      setIsAtBottom(atBottom);
    };
    checkAtBottom();
    viewport.addEventListener('scroll', checkAtBottom, { passive: true });
    return () => viewport.removeEventListener('scroll', checkAtBottom);
  }, [messages.length]);

  const isReady = status === 'ready';
  const isLoading = status === 'submitted' || status === 'streaming';
  const canSend = sessionId && isReady && input.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const text = input.trim();
    setInput('');
    pendingFocusRef.current = true;
    sendMessage(
      { text },
      { body: { session_id: sessionId! } },
    );
    requestAnimationFrame(() => scrollToBottom());
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Card className="flex flex-1 flex-col overflow-hidden rounded-none border-0 shadow-none gap-0">
        {backendConnected === false && (
          <div className="shrink-0 border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            Backend disconnected. Check that the server is running and try again.
          </div>
        )}
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">Chat</h1>
        </header>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-0">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div
                ref={messagesContainerRef}
                className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-1 py-8 text-center">
                    <p className="text-lg font-medium">What can I help with today?</p>
                    <p className="text-sm text-muted-foreground">
                      Ask anything and I’ll do my best to help.
                    </p>
                  </div>
                )}
                <MessageList messages={messages} />
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            </ScrollArea>
            {messages.length > 0 && !isAtBottom && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-9 rounded-full shadow-md pointer-events-auto"
                  aria-label="Scroll to bottom"
                  onClick={scrollToBottom}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mx-auto flex h-[42px] w-full max-w-3xl shrink-0 items-end overflow-hidden px-4">
            {isLoading && <LoadingIndicator />}
          </div>
          <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-xl border border-input bg-background p-2"
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything"
                rows={1}
                disabled={!sessionId}
                className="min-h-10 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                aria-label="Message input"
              />
              <Button
                type="submit"
                disabled={!canSend}
                size="icon"
                aria-label="Send message"
                className="size-9 shrink-0"
              >
                <ArrowUp className="size-4" />
              </Button>
            </form>
          </div>
          <p className="shrink-0 pb-3 text-center text-xs text-muted-foreground">
            Responses may be inaccurate. Check important info.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
