import { Plus, MessageSquare, Trash2, X, Info } from 'lucide-react';
import { Conversation } from '@/lib/chatStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-backdrop"
        onClick={onClose}
      />
      <aside className="relative w-72 max-w-[80vw] h-full bg-sidebar flex flex-col animate-slide-in-left shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Chats</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        <button
          onClick={() => { onNewChat(); onClose(); }}
          className="mx-4 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl gradient-accent text-white font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                conv.id === activeId
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
              }`}
              onClick={() => { onSelectConversation(conv.id); onClose(); }}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>SmartAI v1.0 — Built and Engineered by Sanjay Gummadi as a Portfolio Project.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
