import { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Message } from '@/lib/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
}

export default function ChatWindow({ messages, isLoading, onRegenerate, onEditMessage }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 rounded-3xl gradient-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Smart AI</h2>
        <p className="text-muted-foreground text-center text-sm max-w-xs mb-8">
          Your intelligent assistant. Ask me anything — from coding to creative writing.
        </p>
        <div className="grid gap-2 w-full max-w-xs">
          {['Explain quantum computing', 'Write a React component', 'Help me brainstorm ideas'].map(
            (suggestion) => (
              <button
                key={suggestion}
                className="text-left text-sm px-4 py-3 rounded-2xl bg-secondary hover:bg-muted text-foreground transition-colors active:scale-[0.98]"
                onClick={() => {
                  // This will be handled by the parent
                  const event = new CustomEvent('suggestion-click', { detail: suggestion });
                  window.dispatchEvent(event);
                }}
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLast={i === messages.length - 1 && msg.role === 'assistant'}
          onRegenerate={msg.role === 'assistant' && i === messages.length - 1 ? onRegenerate : undefined}
          onEdit={msg.role === 'user' ? onEditMessage : undefined}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
