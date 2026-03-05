import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Trash2, Sparkles, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  onOpenSettings: () => void;
}

export default function Header({ onToggleSidebar, onClearChat, hasMessages, onOpenSettings }: HeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('smartai_auth');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/auth', { replace: true });
  }, [navigate]);

  const handleClear = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmClear = useCallback(() => {
    onClearChat();
    setShowConfirm(false);
  }, [onClearChat]);

  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-secondary transition-colors active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Smart AI</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            GPT
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-secondary transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleClear}
            disabled={!hasMessages}
            className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-30 active:scale-95"
            aria-label="Clear chat"
          >
            <Trash2 className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-secondary transition-colors active:scale-95"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-backdrop"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="glass-panel rounded-3xl p-6 w-full max-w-sm animate-message-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">Clear conversation?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will delete all messages in the current chat. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 py-2.5 rounded-2xl bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
