import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Paperclip, Loader2, ArrowLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import {
  supportService,
  type SupportCategory,
  type SupportArticle,
} from '@/lib/api/support.service';

interface HelpCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickReplyButton {
  id: string;
  label: string;
  icon?: string;
}

interface ArticleSummary {
  id: string;
  title: string;
  content: string;
  category: { id: string; name: string; code: string };
}

type Step =
  | { type: 'categories' }
  | { type: 'questions'; category: SupportCategory; articles: SupportArticle[] }
  | { type: 'answer'; article: ArticleSummary; category: SupportCategory };

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReplyButton[];
}

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
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>({ type: 'categories' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName = profile?.prenom ?? '';

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setCurrentStep({ type: 'categories' });
      setDraft('');
    }
  }, [isOpen]);

  // Load categories and send welcome
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      supportService.getCategories().then((cats) => {
        setCategories(cats);
        const buttons: QuickReplyButton[] = cats.map((c) => ({
          id: c.id,
          label: c.name,
        }));
        const welcomeMsg: ChatMessage = {
          id: 'welcome',
          sender: 'bot',
          content: t('helpCenter.welcome', { name: userName || '👋' }),
          timestamp: new Date(),
          quickReplies: buttons,
        };
        setMessages([welcomeMsg]);
      });
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

  const addBotMessage = useCallback(
    (content: string, quickReplies?: QuickReplyButton[]) => {
      const reply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content,
        timestamp: new Date(),
        quickReplies,
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    },
    [],
  );

  const addUserMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Handle category click
  const handleCategoryClick = useCallback(
    async (categoryId: string) => {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;

      addUserMessage(cat.name);
      setIsTyping(true);
      setCurrentStep({ type: 'categories' }); // will update after load

      try {
        const articles = await supportService.getArticles();
        const catArticles = articles.filter((a) => a.categoryId === categoryId);
        setCurrentStep({ type: 'questions', category: cat, articles: catArticles });

        const buttons: QuickReplyButton[] = catArticles.map((a) => ({
          id: a.id,
          label: a.title,
        }));

        setTimeout(() => {
          addBotMessage(
            t('helpCenter.chooseQuestion') + '\n\n' + cat.name,
            buttons,
          );
        }, 500);
      } catch {
        addBotMessage(t('helpCenter.noResult'), [
          { id: '__back__', label: t('helpCenter.backToCategories') },
        ]);
      }
    },
    [categories, addUserMessage, addBotMessage, t],
  );

  // Handle article click
  const handleArticleClick = useCallback(
    (articleId: string) => {
      if (currentStep.type !== 'questions') return;
      const article = currentStep.articles.find((a) => a.id === articleId);
      if (!article) return;

      addUserMessage(article.title);
      setCurrentStep({ type: 'answer', article, category: currentStep.category });

      setTimeout(() => {
        addBotMessage(article.content, [
          { id: '__back_questions__', label: t('helpCenter.backToQuestions') },
          { id: '__back_categories__', label: t('helpCenter.backToCategories') },
          { id: '__agent__', label: t('helpCenter.talkToAgent') },
        ]);
      }, 500);
    },
    [currentStep, addUserMessage, addBotMessage, t],
  );

  // Handle back buttons
  const handleBackToCategories = useCallback(() => {
    addUserMessage(t('helpCenter.back'));
    setCurrentStep({ type: 'categories' });

    const buttons: QuickReplyButton[] = categories.map((c) => ({
      id: c.id,
      label: c.name,
    }));

    setTimeout(() => {
      addBotMessage(t('helpCenter.chooseCategory'), buttons);
    }, 300);
  }, [categories, addUserMessage, addBotMessage, t]);

  const handleBackToQuestions = useCallback(() => {
    if (currentStep.type !== 'answer') return;
    addUserMessage(t('helpCenter.back'));

    const { category } = currentStep;
    const fullCat = categories.find((c) => c.id === category.id) ?? category;
    // Reload articles for this category
    supportService.getArticles().then((articles) => {
      const catArticles = articles.filter((a) => a.categoryId === category.id);
      setCurrentStep({ type: 'questions', category: fullCat, articles: catArticles });

      const buttons: QuickReplyButton[] = catArticles.map((a) => ({
        id: a.id,
        label: a.title,
      }));

      setTimeout(() => {
        addBotMessage(
          t('helpCenter.chooseQuestion') + '\n\n' + category.name,
          buttons,
        );
      }, 300);
    });
  }, [currentStep, addUserMessage, addBotMessage, t]);

  // Handle talk to agent
  const handleTalkToAgent = useCallback(() => {
    addUserMessage(t('helpCenter.talkToAgent'));
    setTimeout(() => {
      addBotMessage(t('helpCenter.agentMessage'));
    }, 500);
  }, [addUserMessage, addBotMessage, t]);

  // Handle quick reply click
  const handleQuickReplyClick = useCallback(
    (buttonId: string) => {
      if (buttonId === '__back__' || buttonId === '__back_categories__') {
        handleBackToCategories();
      } else if (buttonId === '__back_questions__') {
        handleBackToQuestions();
      } else if (buttonId === '__agent__') {
        handleTalkToAgent();
      } else if (currentStep.type === 'categories') {
        handleCategoryClick(buttonId);
      } else if (currentStep.type === 'questions') {
        handleArticleClick(buttonId);
      }
    },
    [
      currentStep,
      handleBackToCategories,
      handleBackToQuestions,
      handleTalkToAgent,
      handleCategoryClick,
      handleArticleClick,
    ],
  );

  // Handle free text search
  const handleSend = () => {
    if (!draft.trim()) return;
    const query = draft.trim();
    addUserMessage(query);
    setDraft('');
    setIsTyping(true);

    supportService
      .search(query)
      .then((results) => {
        if (results.length > 0 && results[0]) {
          const best = results[0];
          const fullCat = categories.find((c) => c.id === best.article.category.id);
          if (fullCat) {
            setCurrentStep({
              type: 'answer',
              article: best.article,
              category: fullCat,
            });
          } else {
            setCurrentStep({ type: 'categories' });
          }
          addBotMessage(best.article.content, [
            { id: '__back_categories__', label: t('helpCenter.backToCategories') },
            { id: '__agent__', label: t('helpCenter.talkToAgent') },
          ]);
        } else {
          const buttons: QuickReplyButton[] = categories.map((c) => ({
            id: c.id,
            label: c.name,
          }));
          addBotMessage(t('helpCenter.noResult'), buttons);
        }
      })
      .catch(() => {
        addBotMessage(t('helpCenter.noResult'), [
          { id: '__back__', label: t('helpCenter.backToCategories') },
        ]);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        className={`fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[480px] bg-white dark:bg-[#0b1e24] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
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
                <div className="flex flex-col gap-2">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-allness-green/20 text-[#082B37] dark:text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {msg.quickReplies.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => handleQuickReplyClick(btn.id)}
                          className="w-full flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
                        >
                          {btn.id.startsWith('__') && (
                            <ArrowLeft className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          )}
                          <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                            {btn.label}
                          </span>
                          {!btn.id.startsWith('__') && (
                            <span className="text-gray-300 dark:text-white/20 group-hover:text-gray-400 dark:group-hover:text-white/40 transition-colors">
                              ›
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className={`mt-0.5 text-[10px] text-gray-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
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
