import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  type?: 'error' | 'info';
  onClose: () => void;
}

export function ToastNotification({ message, type = 'error', onClose }: ToastNotificationProps) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl ${
        type === 'error' ? 'bg-destructive text-destructive-foreground' : 'glass-panel text-foreground'
      }`}>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-600/90 text-white text-xs text-center py-1.5 px-3 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      You're offline. Messages won't be sent.
    </div>
  );
}
