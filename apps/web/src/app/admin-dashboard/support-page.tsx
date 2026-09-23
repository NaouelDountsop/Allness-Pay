import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, Loader2, User, ShieldCheck, Circle } from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { supportService } from '../../lib/api/support.service';
import type { SupportConversation, SupportMessage } from '../../lib/api/support.service';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_BADGE: Record<string, { tone: 'green' | 'orange' | 'red'; label: string }> = {
  open: { tone: 'orange', label: 'Ouvert' },
  closed: { tone: 'green', label: 'Fermé' },
};

const DEFAULT_BADGE = { tone: 'orange' as const, label: 'Inconnu' };

export default function SupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await supportService.getConversations();
      setConversations(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll for new conversations every 10s
  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const selectConversation = useCallback(async (id: number) => {
    setSelectedId(id);
    setLoadingMessages(true);
    try {
      const [msgs] = await Promise.all([
        supportService.getMessages(id),
        supportService.markAsRead(id),
      ]);
      setMessages(msgs);
      fetchConversations();
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, [fetchConversations]);

  // Poll messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await supportService.getMessages(selectedId);
        setMessages(msgs);
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedId) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const msg = await supportService.sendMessage(selectedId, content);
      setMessages((prev) => [...prev, msg]);
      fetchConversations();
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await supportService.markAsRead(id);
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.patch(`/support/conversations/${id}`, { status: 'closed' });
      fetchConversations();
    } catch {
      // silent
    }
  };

  const handleReopen = async (id: number) => {
    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.patch(`/support/conversations/${id}`, { status: 'open' });
      fetchConversations();
    } catch {
      // silent
    }
  };

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <AdminLayout active="support">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Support</p>
        <h1 className="mt-2 text-2xl font-semibold text-allness-dark">Conversations utilisateurs</h1>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-80 shrink-0 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const badge = STATUS_BADGE[conv.status] ?? DEFAULT_BADGE;
                const isAgent = conv.lastMessage?.senderType === 'admin';
                const rowCls = isAgent
                  ? selectedId === conv.id
                    ? 'bg-allness-green/5 border-l-allness-green'
                    : 'border-l-allness-green/40'
                  : selectedId === conv.id
                    ? 'bg-allness-orange/5 border-l-allness-orange'
                    : 'border-l-allness-orange/40';
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors border-l-2 ${rowCls}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-allness-dark truncate">
                        {conv.subject || 'Conversation'}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 h-5 min-w-[20px] rounded-full bg-allness-green text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage?.content || 'Aucun message'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        {conv.userName}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          badge.tone === 'green'
                            ? 'bg-green-50 text-green-600'
                            : badge.tone === 'orange'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <img
                src="/Messages-cuate.svg"
                alt="Sélectionnez une conversation"
                className="w-64 h-64 mb-4"
              />
              <p className="text-sm text-gray-400">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-allness-orange/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-allness-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-allness-dark">
                      {selected?.subject || 'Conversation'}
                    </p>
                    <p className="text-[11px] text-gray-400">{selected?.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected?.status === 'open' && (
                    <button
                      onClick={() => handleClose(selected.id)}
                      className="h-7 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Fermer
                    </button>
                  )}
                  {selected?.status === 'closed' && (
                    <button
                      onClick={() => handleReopen(selected.id)}
                      className="h-7 px-3 rounded-lg border border-allness-green/30 text-xs font-medium text-allness-green hover:bg-allness-green/5"
                    >
                      Rouvrir
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucun message</p>
                ) : (
                  messages.map((msg) => {
                    const isAgent = msg.senderType === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isAgent
                              ? 'bg-allness-green/20 text-allness-dark rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {isAgent ? (
                              <ShieldCheck className="w-3 h-3 text-allness-green" />
                            ) : (
                              <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                            )}
                            <span className="text-[10px] font-medium text-gray-400">
                              {isAgent ? 'Agent' : selected?.userName || 'Utilisateur'}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-gray-100 shrink-0">
                {selected?.status === 'closed' && (
                  <p className="text-[11px] text-allness-green mb-2 text-center">
                    Conversation fermée — envoyer un message pour la rouvrir
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Votre réponse..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className="h-10 w-10 rounded-xl bg-allness-green text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
