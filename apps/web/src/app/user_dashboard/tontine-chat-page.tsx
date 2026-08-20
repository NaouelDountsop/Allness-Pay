import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Users,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  SquarePen,
  Paperclip,
  Smile,
  Send,
  Pin,
  X,
  FileText,
  Plus,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { Button } from "@/components/ui/button";
import { tontineService, type Tontine, type TontineMember } from "@/lib/api/tontine.service";

interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  emoji?: string;
  lastSenderIsMe?: boolean;
  lastSenderName?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  hasAttachment?: boolean;
  active?: boolean;
}

interface Message {
  id: string;
  author: string;
  avatarUrl: string;
  time: string;
  content: string;
  isMine?: boolean;
  reactions?: { emoji: string; count: number }[];
  read?: boolean;
}

interface Member {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Admin' | 'Membre' | 'Prochain tour';
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Tontine Famille Unie',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    lastSenderName: 'Awa',
    lastMessage: "N'oubliez pas le versement...",
    time: '10:45',
    unreadCount: 3,
    active: true,
  },
  {
    id: '2',
    name: 'Cagnotte Vacances',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    emoji: '🏖️',
    lastSenderName: 'Jean',
    lastMessage: 'Super, merci à tous !',
    time: '09:32',
    unreadCount: 1,
  },
  {
    id: '3',
    name: 'Tontine Entre Nous',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    lastSenderName: 'Amélie',
    lastMessage: 'Qui est le tour ce mois-ci ?',
    time: 'Hier',
  },
  {
    id: '4',
    name: 'Projet Maison',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    emoji: '🏠',
    lastSenderIsMe: true,
    lastMessage: "J'ai partagé un document",
    time: 'Hier',
    hasAttachment: true,
  },
  {
    id: '5',
    name: 'Tontine des Copines',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    emoji: '💜',
    lastSenderName: 'Fatou',
    lastMessage: "D'accord, merci !",
    time: '12/05',
  },
  {
    id: '6',
    name: 'Épargne Études',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    emoji: '🎓',
    lastSenderName: 'Moussa',
    lastMessage: 'Parfait',
    time: '10/05',
  },
];

const MESSAGES: Message[] = [
  {
    id: 'm1',
    author: 'Awa Traoré',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    time: '10:30',
    content:
      "Bonjour la famille 👋 N'oubliez pas le versement du mois de Mai. Date limite : 25/05 à 18h.",
    reactions: [
      { emoji: '👍', count: 4 },
      { emoji: '❤️', count: 2 },
    ],
  },
  {
    id: 'm2',
    author: 'Jean Dupont',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    time: '10:32',
    content: "Merci pour le rappel Awa. Je vais effectuer mon versement aujourd'hui.",
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: 'm3',
    author: 'Amélie Laurent',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    time: '10:35',
    content:
      'Parfait 👍 N\'oubliez pas d\'ajouter le motif : "Tontine Famille Unie" lors du paiement.',
  },
  {
    id: 'm4',
    author: 'Moi',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    time: '10:36',
    content: 'Reçu, merci Amélie ! Je viens de faire le versement ✅',
    isMine: true,
    read: true,
    reactions: [{ emoji: '❤️', count: 2 }],
  },
  {
    id: 'm5',
    author: 'Moussa Koné',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    time: '10:45',
    content: 'Super, merci à tous pour votre ponctualité 🙏 On avance bien !',
    reactions: [{ emoji: '🎉', count: 3 }],
  },
];

const MEMBERS: Member[] = [
  { id: 'u1', name: 'Sophie D.', avatarUrl: 'https://i.pravatar.cc/150?img=47', role: 'Admin' },
  {
    id: 'u2',
    name: 'Awa Traoré',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'Prochain tour',
  },
  { id: 'u3', name: 'Jean Dupont', avatarUrl: 'https://i.pravatar.cc/150?img=12', role: 'Membre' },
  {
    id: 'u4',
    name: 'Amélie Laurent',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    role: 'Membre',
  },
  { id: 'u5', name: 'Moussa Koné', avatarUrl: 'https://i.pravatar.cc/150?img=3', role: 'Membre' },
];

function ConversationItem({
  conversation,
  onClick,
}: {
  conversation: Conversation;
  onClick?: () => void;
}) {
  const preview = conversation.lastSenderIsMe
    ? `Vous : ${conversation.lastMessage}`
    : conversation.lastSenderName
      ? `${conversation.lastSenderName} : ${conversation.lastMessage}`
      : conversation.lastMessage;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
        conversation.active
          ? 'border-l-4 border-l-allness-green bg-allness-green/5'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative">
        <img
          src={conversation.avatarUrl}
          alt={conversation.name}
          className="h-11 w-11 rounded-full object-cover"
        />
        {conversation.active && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-allness-green" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-gray-900">{conversation.name}</p>
          <span className="shrink-0 text-[11px] text-gray-400">{conversation.time}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-gray-500">
            {conversation.hasAttachment ? '📎 ' : ''}
            {preview}
          </p>
          {conversation.unreadCount ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-allness-green text-[11px] font-semibold text-white">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.isMine) {
    return (
      <div className="flex items-end justify-end gap-2.5">
        <div className="max-w-[70%]">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[11px] text-gray-400">{message.time}</span>
            {message.read ? <span className="text-[11px] text-allness-green">✓✓</span> : null}
          </div>
          <div className="mt-1 rounded-2xl rounded-br-sm bg-allness-green px-4 py-2.5 text-sm text-white">
            {message.content}
          </div>
          {message.reactions?.length ? (
            <div className="mt-1.5 flex justify-end gap-1.5">
              {message.reactions.map((r) => (
                <span
                  key={r.emoji}
                  className="rounded-full border border-gray-100 bg-white px-2 py-0.5 text-xs shadow-sm"
                >
                  {r.emoji} {r.count}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <img
          src={message.avatarUrl}
          alt={message.author}
          className="h-8 w-8 rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <img
        src={message.avatarUrl}
        alt={message.author}
        className="h-8 w-8 rounded-full object-cover"
      />
      <div className="max-w-[70%]">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold text-gray-900">{message.author}</p>
          <span className="text-[11px] text-gray-400">{message.time}</span>
        </div>
        <div className="mt-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
          {message.content}
        </div>
        {message.reactions?.length ? (
          <div className="mt-1.5 flex gap-1.5">
            {message.reactions.map((r) => (
              <span
                key={r.emoji}
                className="rounded-full border border-gray-100 bg-white px-2 py-0.5 text-xs shadow-sm"
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <img
          src={member.avatarUrl}
          alt={member.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-gray-900">{member.name}</span>
      </div>
      {member.role === 'Admin' ? (
        <span className="text-xs text-gray-400">Admin</span>
      ) : member.role === 'Prochain tour' ? (
        <span className="rounded-full bg-allness-green/10 px-2.5 py-1 text-[11px] font-semibold text-allness-green">
          Prochain tour
        </span>
      ) : (
        <span className="text-xs text-gray-400">Membre</span>
      )}
    </div>
  );
}

function ChatArea({
  conversation,
  tontine,
  onBack,
}: {
  conversation: Conversation;
  tontine?: Tontine | null;
  onBack?: () => void;
}) {
  const [pinnedVisible, setPinnedVisible] = useState(true);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-[2rem] border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <img
            src="https://i.pravatar.cc/150?img=11"
            alt="Tontine Famille Unie"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {tontine?.name ?? conversation.name}
              </p>
              <span className="rounded-full bg-allness-green/10 px-2 py-0.5 text-[11px] font-semibold text-allness-green">
                {tontine?.status === 'ACTIVE' ? 'Active' : (tontine?.status ?? 'Active')}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {tontine?.members?.length ?? 12} membres
              {tontine?.nextContributionAt
                ? ` · Prochain tour : ${new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR')}`
                : ' · Prochain tour : Awa · 25 Mai 2024'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-full p-2 text-gray-400 hover:bg-gray-50"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 text-gray-400 hover:bg-gray-50" aria-label="Membres">
            <Users className="h-4 w-4" />
          </button>
          <button
            className="rounded-full p-2 text-gray-400 hover:bg-gray-50"
            aria-label="Plus d'options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {pinnedVisible ? (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Pin className="h-3.5 w-3.5" />
              Message épinglé
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              Rappel : Versement du mois de Mai avant le 25/05 à 18h.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button className="text-xs font-medium text-allness-green">Voir</button>
            <button
              onClick={() => setPinnedVisible(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fermer le message épinglé"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <MessageBubble message={MESSAGES[0]!} />
        <MessageBubble message={MESSAGES[1]!} />
        <MessageBubble message={MESSAGES[2]!} />
        <MessageBubble message={MESSAGES[3]!} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-allness-green/20" />
          <span className="text-xs font-medium text-allness-green">Nouveaux messages</span>
          <div className="h-px flex-1 bg-allness-green/20" />
        </div>

        <MessageBubble message={MESSAGES[4]!} />
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-4">
        <button className="text-gray-400 hover:text-gray-600" aria-label="Joindre un fichier">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          className="flex-1 rounded-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <button className="text-gray-400 hover:text-gray-600" aria-label="Émoji">
          <Smile className="h-5 w-5" />
        </button>
        <button
          onClick={handleSend}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-allness-green text-white hover:bg-allness-green/90"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function TontineAboutPanel({
  tontine,
  members,
}: {
  tontine?: Tontine | null;
  members?: TontineMember[];
}) {
  return (
    <aside className="hidden min-w-0 flex-col overflow-y-auto rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm xl:flex xl:w-full xl:max-w-[280px] xl:min-h-0 xl:border-none">
      <p className="text-sm font-semibold text-gray-900">À propos de la tontine</p>

      <div className="mt-4 flex flex-col items-center text-center">
        <img
          src="https://i.pravatar.cc/150?img=47"
          alt={tontine?.name ?? 'Tontine'}
          className="h-16 w-16 rounded-full object-cover"
        />
        <p className="mt-3 text-sm font-semibold text-gray-900">
          {tontine?.name ?? 'Tontine Famille Unie'}
        </p>
        <span className="mt-1 rounded-full bg-allness-green/10 px-2.5 py-0.5 text-[11px] font-semibold text-allness-green">
          {tontine?.status === 'ACTIVE' ? 'Active' : (tontine?.status ?? 'Active')}
        </span>
      </div>

      <div className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
        <InfoRow
          icon={Users}
          label="Créée par"
          value={
            tontine?.creator
              ? `${tontine.creator.prenom ?? ''} ${tontine.creator.nom ?? ''}`.trim() || 'Inconnu'
              : 'Sophie D.'
          }
        />
        <InfoRow
          icon={Users}
          label="Date de création"
          value={
            tontine?.createdAt
              ? new Date(tontine.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '12 Jan 2024'
          }
        />
        <InfoRow
          icon={Users}
          label="Nombre de membres"
          value={String(tontine?.members?.length ?? 12)}
        />
        <InfoRow
          icon={Users}
          label="Montant de cotisation"
          value={
            tontine?.contributionAmount
              ? `${Number(tontine.contributionAmount).toLocaleString('fr-FR')} ${tontine.currency ?? 'FCFA'}`
              : '25 000 FCFA'
          }
        />
        <InfoRow icon={Users} label="Fréquence" value={tontine?.frequency ?? 'Mensuelle'} />
        <InfoRow
          icon={Users}
          label="Prochain tour"
          value={
            tontine?.nextContributionAt
              ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR')
              : 'Awa Traoré (8/12) / 25 Mai 2024'
          }
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            Membres ({tontine?.members?.length ?? 12})
          </p>
          <button className="text-xs font-medium text-allness-green">Voir tout</button>
        </div>
        <div className="mt-1 divide-y divide-gray-50">
          {(members ?? MEMBERS).map((m) => {
            const hasUserProp = "user" in m && m.user;
            const mapped: Member = {
              id: String(m.id),
              name: hasUserProp
                ? `${(m as TontineMember).user?.prenom ?? ''} ${(m as TontineMember).user?.nom ?? ''}`.trim() ||
                  `Membre ${m.id}`
                : (('name' in m ? (m as Member).name : `Membre ${m.id}`) ?? `Membre ${m.id}`),
              avatarUrl: `https://i.pravatar.cc/150?u=${m.id}`,
              role:
                m.role === 'ADMIN'
                  ? 'Admin'
                  : m.role === 'BENEFICIARY'
                    ? 'Prochain tour'
                    : 'Membre',
            };
            return <MemberRow key={mapped.id} member={mapped} />;
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Fichiers partagés</p>
          <button className="text-xs font-medium text-allness-green">Voir tout</button>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-gray-50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">Reglement_tontine.pdf</p>
              <p className="text-[11px] text-gray-400">PDF · 1.2 Mo</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function TontineChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSingleTontine = !!id;

  const {
    data: tontine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const activeConversation = useMemo(
    () => CONVERSATIONS.find((c) => c.active) ?? CONVERSATIONS[0]!,
    [],
  );

  if (isSingleTontine && isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-allness-green" />
        </div>
      </DashboardLayout>
    );
  }

  if (isSingleTontine && (error || !tontine)) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">Tontine introuvable</p>
            <p className="mt-1 text-xs text-gray-500">
              Cette tontine n'existe pas ou vous n'avez pas accès.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full border-allness-green text-allness-green hover:bg-allness-green/5"
              onClick={() => navigate('/dashboard/tontines')}
            >
              Retour aux tontines
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isSingleTontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex h-[calc(100vh-140px)] min-h-0 min-w-0 gap-4 overflow-hidden">
          <ChatArea
            conversation={activeConversation}
            tontine={tontine}
            onBack={() => navigate('/dashboard/tontines')}
          />
          <TontineAboutPanel tontine={tontine} members={tontine?.members} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="flex h-[calc(100vh-140px)] min-h-0 min-w-0 gap-4 overflow-hidden">
        <aside className="flex min-h-0 min-w-0 w-full max-w-[300px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <button
              onClick={() => navigate('/dashboard/tontines')}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Retour aux tontines"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-semibold text-gray-900 flex-1">Messagerie</h2>
            <div className="flex items-center gap-1">
              <button
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50"
                aria-label="Filtrer"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50"
                aria-label="Trier"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
              <button
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50"
                aria-label="Nouvelle conversation"
              >
                <SquarePen className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Rechercher une conversation..."
                className="w-full rounded-full bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
            {CONVERSATIONS.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => navigate(`/dashboard/tontines/${conversation.id}`)}
              />
            ))}
          </div>

          <div className="border-t border-gray-100 p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-allness-green text-allness-green hover:bg-allness-green/5"
              onClick={() => navigate('/dashboard/tontines/create')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer une nouvelle tontine
            </Button>
          </div>
        </aside>

        <ChatArea conversation={activeConversation} />
        <TontineAboutPanel />
      </div>
    </DashboardLayout>
  );
}
