export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2 animate-message-in">
      <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0 text-xs font-bold text-white">
        AI
      </div>
      <div className="bg-ai-bubble rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-1" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-2" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-3" />
      </div>
    </div>
  );
}
