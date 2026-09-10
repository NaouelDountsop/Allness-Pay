import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Send,
  Paperclip,
  HelpCircle,
  Send as SendIcon,
  ArrowLeftRight,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';

interface HelpCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickReply {
  id: string;
  labelKey: string;
  icon: React.ElementType;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: 'payment-refused', labelKey: 'helpCenter.paymentRefused', icon: HelpCircle },
  { id: 'send-money', labelKey: 'helpCenter.sendMoney', icon: SendIcon },
  { id: 'view-transactions', labelKey: 'helpCenter.viewTransactions', icon: ArrowLeftRight },
  { id: 'talk-to-agent', labelKey: 'helpCenter.talkToAgent', icon: MessageCircle },
];

const BOT_RESPONSES: Record<string, string> = {
  'payment-refused': "Un paiement peut être refusé pour plusieurs raisons : solde insuffisant, données de carte incorrectes, ou limite de transaction dépassée. Pouvez-vous me donner plus de détails sur votre problème ?",
  'send-money': "Pour envoyer de l'argent, allez dans 'Envoyer', sélectionnez un bénéficiaire, entrez le montant et confirmez avec votre PIN. Besoin d'aide pour une étape spécifique ?",
  'view-transactions': "Vous pouvez consulter l'historique de vos transactions dans la section 'Transactions' du menu. Voulez-vous que je vous y guide ?",
  'talk-to-agent': "Je vais vous mettre en relation avec un conseiller. Un agent sera disponible dans quelques instants. En attendant, décrivez votre problème.",
};

function HelpCenterAvatar() {
  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-allness-green/20 flex items-center justify-center">
      <img src="/allnesspay_logo2.png" alt="Bot" className="h-6 w-6 object-contain" />
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function HelpCenterPanel({ isOpen, onClose }: HelpCenterPanelProps) {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName = profile?.prenom ?? '';

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        sender: 'bot',
        content: t('helpCenter.welcome', { name: userName || '👋' }),
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length, t, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const simulateBotReply = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (replyId: string) => {
    const reply = QUICK_REPLIES.find((r) => r.id === replyId);
    if (!reply) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: t(reply.labelKey),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const botResponse = BOT_RESPONSES[replyId] ?? "Merci pour votre question. Un conseiller va vous aider.";
    simulateBotReply(botResponse);
  };

  const handleSend = () => {
    if (!draft.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: draft.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    simulateBotReply("Merci pour votre message. Un conseiller prendra en charge votre demande très rapidement.");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showQuickReplies = messages.length <= 1;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[420px] bg-white dark:bg-[#0b1e24] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0D343A] dark:bg-[#061216] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 flex items-center justify-center">
              <img src="/allnesspay_logo1.png" alt="AllnessPay" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{t('helpCenter.title')}</h2>
              <p className="text-xs text-white/60">{t('helpCenter.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={t('helpCenter.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && <HelpCenterAvatar />}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-allness-green/20 text-[#082B37] dark:text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`mt-1 text-[10px] text-gray-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <HelpCenterAvatar />
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-white/5 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {showQuickReplies && (
          <div className="px-4 pb-3 space-y-2">
            {QUICK_REPLIES.map((reply) => {
              const Icon = reply.icon;
              return (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.id)}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-allness-green/10 text-allness-green">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t(reply.labelKey)}
                  </span>
                  <span className="text-gray-300 dark:text-white/20 group-hover:text-gray-400 dark:group-hover:text-white/40 transition-colors">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 transition-colors"
              aria-label={t('helpCenter.attachFile')}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('helpCenter.inputPlaceholder')}
              className="flex-1 min-w-0 rounded-full bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-allness-orange"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-allness-green text-white hover:bg-allness-green/90 disabled:opacity-40 shrink-0 transition-colors"
              aria-label={t('helpCenter.send')}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>{t('helpCenter.online')}</span>
            <span>·</span>
            <span>{t('helpCenter.responseTime')}</span>
          </div>
        </div>
      </div>
    </>
  );
}
