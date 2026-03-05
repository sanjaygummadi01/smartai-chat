import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, RefreshCw, Pencil } from 'lucide-react';
import { Message } from '@/lib/chatStore';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

function formatContent(content: string) {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        parts.push(
          <div key={key++} className="my-2 rounded-xl overflow-hidden bg-background border border-border">
            {codeLang && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground bg-secondary border-b border-border font-mono">
                {codeLang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-sm">
              <code className="text-foreground font-mono">{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    let processed = line;
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-secondary text-sm font-mono">$1</code>');

    if (processed.startsWith('> ')) {
      parts.push(
        <blockquote key={key++} className="border-l-2 border-primary pl-3 my-1 text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
      );
      continue;
    }
    if (processed.startsWith('### ')) {
      parts.push(<h3 key={key++} className="font-semibold text-foreground mt-2 mb-1" dangerouslySetInnerHTML={{ __html: processed.slice(4) }} />);
      continue;
    }
    if (processed.startsWith('## ')) {
      parts.push(<h2 key={key++} className="font-semibold text-lg text-foreground mt-2 mb-1" dangerouslySetInnerHTML={{ __html: processed.slice(3) }} />);
      continue;
    }
    if (/^[-*] /.test(processed)) {
      parts.push(
        <div key={key++} className="flex gap-2 ml-1">
          <span className="text-primary mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
        </div>
      );
      continue;
    }
    if (/^\d+\. /.test(processed)) {
      const num = processed.match(/^(\d+)\. /)?.[1];
      const text = processed.replace(/^\d+\. /, '');
      parts.push(
        <div key={key++} className="flex gap-2 ml-1">
          <span className="text-primary font-medium">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      );
      continue;
    }
    if (processed.includes('|') && processed.trim().startsWith('|')) {
      if (/^\|[\s-|]+\|$/.test(processed.trim())) continue;
      const cells = processed.split('|').filter(c => c.trim());
      parts.push(
        <div key={key++} className="flex gap-4 text-sm py-1 px-2 even:bg-secondary/50 rounded">
          {cells.map((cell, ci) => (
            <span key={ci} className="flex-1" dangerouslySetInnerHTML={{ __html: cell.trim() }} />
          ))}
        </div>
      );
      continue;
    }
    if (processed.trim() === '') {
      parts.push(<div key={key++} className="h-2" />);
      continue;
    }

    parts.push(
      <p key={key++} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />
    );
  }

  return parts;
}

export default function MessageBubble({ message, isLast, onRegenerate, onEdit }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleEditSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content && onEdit) {
      onEdit(message.id, trimmed);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === 'Escape') {
      setEditContent(message.content);
      setEditing(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-1.5 animate-message-in`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0 text-xs font-bold text-white mt-1">
            AI
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isUser
                ? 'bg-user-bubble text-white rounded-tr-md'
                : 'bg-ai-bubble text-foreground rounded-tl-md'
            }`}
          >
            {isUser && editing ? (
              <div className="space-y-2">
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={handleEditKeyDown}
                  className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none resize-none min-w-[200px]"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setEditContent(message.content); setEditing(false); }}
                    className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-3 py-1 text-xs rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium"
                  >
                    Save & Send
                  </button>
                </div>
              </div>
            ) : isUser ? (
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="space-y-1">{formatContent(message.content)}</div>
            )}
          </div>

          <div className={`flex gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isUser && onEdit && !editing && (
              <button
                onClick={() => { setEditContent(message.content); setEditing(true); }}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {!isUser && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
