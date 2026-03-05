import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/chat/Header';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import SettingsModal from '@/components/chat/SettingsModal';
import { ToastNotification, OfflineBanner } from '@/components/chat/Toast';
import { streamChat, ChatMessage } from '@/lib/ai';
import {
  Conversation,
  Message,
  loadConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  createConversation,
  generateId,
  generateTitle,
} from '@/lib/chatStore';

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveConversationId());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const assistantContentRef = useRef('');

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    setActiveConversationId(activeId);
  }, [activeId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (msg) handleSend(msg);
    };
    window.addEventListener('suggestion-click', handler);
    return () => window.removeEventListener('suggestion-click', handler);
  }, [activeId, conversations]);

  const updateConversation = useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    },
    []
  );

  const buildChatMessages = (msgs: Message[]): ChatMessage[] => {
    return msgs.map((m) => ({ role: m.role, content: m.content }));
  };

  const handleSend = useCallback(
    async (content: string) => {
      let convId = activeId;
      let isNew = false;

      if (!convId) {
        const newConv = createConversation();
        newConv.title = generateTitle(content);
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
        convId = newConv.id;
        isNew = true;
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const addMsg = (conv: Conversation) => ({
        ...conv,
        messages: [...conv.messages, userMessage],
        updatedAt: Date.now(),
        title: conv.messages.length === 0 ? generateTitle(content) : conv.title,
      });

      if (isNew) {
        setConversations((prev) => prev.map((c) => (c.id === convId ? addMsg(c) : c)));
      } else {
        updateConversation(convId, addMsg);
      }

      setIsLoading(true);
      assistantContentRef.current = '';

      const assistantId = generateId();

      // Get current messages for context
      const currentConv = isNew
        ? [userMessage]
        : [...(conversations.find((c) => c.id === convId)?.messages || []), userMessage];

      await streamChat({
        messages: buildChatMessages(currentConv),
        onDelta: (chunk) => {
          assistantContentRef.current += chunk;
          const currentContent = assistantContentRef.current;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== convId) return c;
              const lastMsg = c.messages[c.messages.length - 1];
              if (lastMsg?.id === assistantId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, content: currentContent } : m
                  ),
                  updatedAt: Date.now(),
                };
              }
              return {
                ...c,
                messages: [
                  ...c.messages,
                  { id: assistantId, role: 'assistant' as const, content: currentContent, timestamp: Date.now() },
                ],
                updatedAt: Date.now(),
              };
            })
          );
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          setIsLoading(false);
          setToast(error);
        },
      });
    },
    [activeId, conversations, updateConversation]
  );

  const handleRegenerate = useCallback(async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;

    const msgs = activeConversation.messages.slice(0, -1);
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    updateConversation(activeConversation.id, (c) => ({ ...c, messages: msgs }));

    setIsLoading(true);
    assistantContentRef.current = '';
    const assistantId = generateId();
    const convId = activeConversation.id;

    await streamChat({
      messages: buildChatMessages(msgs),
      onDelta: (chunk) => {
        assistantContentRef.current += chunk;
        const currentContent = assistantContentRef.current;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            const lastMsg = c.messages[c.messages.length - 1];
            if (lastMsg?.id === assistantId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: currentContent } : m
                ),
                updatedAt: Date.now(),
              };
            }
            return {
              ...c,
              messages: [
                ...c.messages,
                { id: assistantId, role: 'assistant' as const, content: currentContent, timestamp: Date.now() },
              ],
              updatedAt: Date.now(),
            };
          })
        );
      },
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        setToast(error);
      },
    });
  }, [activeConversation, updateConversation]);

  const handleClearChat = useCallback(() => {
    if (!activeId) return;
    updateConversation(activeId, (c) => ({ ...c, messages: [], updatedAt: Date.now() }));
  }, [activeId, updateConversation]);

  const handleNewChat = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!activeId) return;

      // Find the message index, update it, remove all messages after it, and re-send
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const msgIndex = c.messages.findIndex((m) => m.id === messageId);
          if (msgIndex === -1) return c;
          const updatedMessages = c.messages.slice(0, msgIndex);
          updatedMessages.push({ ...c.messages[msgIndex], content: newContent });
          return { ...c, messages: updatedMessages, updatedAt: Date.now() };
        })
      );

      // Now trigger AI response for the edited message
      setIsLoading(true);
      assistantContentRef.current = '';
      const assistantId = generateId();

      // Get messages up to and including the edited one
      const currentConv = conversations.find((c) => c.id === activeId);
      if (!currentConv) return;
      const msgIndex = currentConv.messages.findIndex((m) => m.id === messageId);
      const msgsUpToEdit = currentConv.messages.slice(0, msgIndex).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      msgsUpToEdit.push({ role: 'user' as const, content: newContent });

      await streamChat({
        messages: msgsUpToEdit,
        onDelta: (chunk) => {
          assistantContentRef.current += chunk;
          const currentContent = assistantContentRef.current;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== activeId) return c;
              const lastMsg = c.messages[c.messages.length - 1];
              if (lastMsg?.id === assistantId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, content: currentContent } : m
                  ),
                  updatedAt: Date.now(),
                };
              }
              return {
                ...c,
                messages: [
                  ...c.messages,
                  { id: assistantId, role: 'assistant' as const, content: currentContent, timestamp: Date.now() },
                ],
                updatedAt: Date.now(),
              };
            })
          );
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          setIsLoading(false);
          setToast(error);
        },
      });
    },
    [activeId, conversations]
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      <OfflineBanner />
      <Header
        onToggleSidebar={() => setSidebarOpen(true)}
        onClearChat={handleClearChat}
        hasMessages={messages.length > 0}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onRegenerate={handleRegenerate}
        onEditMessage={handleEditMessage}
      />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {toast && (
        <ToastNotification message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Index;
