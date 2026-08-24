import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Loader2,
  ArrowLeft,
  Image,
} from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { Button } from '@/components/ui/button';
import { tontineService, type Tontine, type TontineMessage } from '@/lib/api/tontine.service';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
  ];
  return colors[Math.abs(hash) % colors.length]!;
}

function Avatar({
  name,
  size = 'h-8 w-8',
}: {
  name: string;
  size?: string;
}) {
  const initials = getInitials(name);
  const bg = stringToColor(name);
  return (
    <div
      className={`${size} ${bg} flex items-center justify-center rounded-full text-xs font-semibold text-white shrink-0`}
    >
      {initials}
    </div>
  );
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: TontineMessage;
  currentUserId?: number;
}) {
  const isMine = message.senderId === currentUserId;
  const isSystem = message.isSystem;
  const time = new Date(message.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs text-gray-500">
          {message.content}
        </span>
      </div>
    );
  }

  const senderName = message.sender
    ? `${message.sender.prenom ?? ''} ${message.sender.nom ?? ''}`.trim() || 'Inconnu'
    : 'Inconnu';

  if (isMine) {
    return (
      <div className="flex items-end justify-end gap-2.5">
        <div className="max-w-[70%]">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[11px] text-gray-400">{time}</span>
          </div>
          {message.content && (
            <div className="mt-1 rounded-2xl rounded-br-sm bg-allness-green px-4 py-2.5 text-sm text-white">
              {message.content}
            </div>
          )}
          {message.attachmentUrl && (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-2 rounded-2xl rounded-br-sm bg-allness-green/90 px-4 py-2.5 text-sm text-white hover:bg-allness-green/80"
            >
              <Paperclip className="h-4 w-4" />
              {message.attachmentName ?? 'Fichier'}
            </a>
          )}
        </div>
        <Avatar name={senderName} />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <Avatar name={senderName} />
      <div className="max-w-[70%]">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold text-gray-900">{senderName}</p>
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>
        {message.content && (
          <div className="mt-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
            {message.content}
          </div>
        )}
        {message.attachmentUrl && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-200"
          >
            <Paperclip className="h-4 w-4" />
            {message.attachmentName ?? 'Fichier'}
          </a>
        )}
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

function MemberRow({
  member,
}: {
  member: { id: string; name: string; role: string };
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <Avatar name={member.name} />
        <span className="text-sm font-medium text-gray-900">{member.name}</span>
      </div>
      {member.role === 'ADMIN' ? (
        <span className="text-xs text-gray-400">Admin</span>
      ) : (
        <span className="text-xs text-gray-400">Membre</span>
      )}
    </div>
  );
}

function ChatArea({
  tontineId,
  tontine,
  currentUserId,
  onBack,
}: {
  tontineId: string;
  tontine?: Tontine | null;
  currentUserId?: number;
  onBack?: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['tontineMessages', tontineId],
    queryFn: () => tontineService.getMessages(tontineId),
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: { content?: string; file?: File }) =>
      tontineService.sendMessage(tontineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontineMessages', tontineId] });
      setDraft('');
      setSelectedFile(null);
    },
  });

  const handleSend = useCallback(() => {
    if (!draft.trim() && !selectedFile) return;
    sendMessageMutation.mutate({
      content: draft.trim() || undefined,
      file: selectedFile ?? undefined,
    });
  }, [draft, selectedFile, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-[2rem] border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Avatar name={tontine?.name ?? 'Tontine'} size="h-10 w-10" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{tontine?.name}</p>
              <span className="rounded-full bg-allness-green/10 px-2 py-0.5 text-[11px] font-semibold text-allness-green">
                {tontine?.status === 'ACTIVE' ? 'Active' : (tontine?.status ?? 'Active')}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {tontine?.members?.length ?? 0} membres
              {tontine?.nextContributionAt
                ? ` · Prochain tour : ${new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR')}`
                : ''}
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

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-allness-green" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Aucun message pour le moment</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2">
          <Paperclip className="h-4 w-4 text-gray-400" />
          <span className="flex-1 truncate text-sm text-gray-600">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Joindre un fichier"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Joindre une image"
        >
          <Image className="h-5 w-5" />
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
          disabled={sendMessageMutation.isPending || (!draft.trim() && !selectedFile)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-allness-green text-white hover:bg-allness-green/90 disabled:opacity-50"
          aria-label="Envoyer"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </section>
  );
}

function TontineAboutPanel({ tontine }: { tontine?: Tontine | null }) {
  return (
    <aside className="hidden min-w-0 flex-col overflow-y-auto rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm xl:flex xl:w-full xl:max-w-[280px] xl:min-h-0 xl:border-none">
      <p className="text-sm font-semibold text-gray-900">À propos de la tontine</p>

      <div className="mt-4 flex flex-col items-center text-center">
        <Avatar name={tontine?.name ?? 'Tontine'} size="h-16 w-16" />
        <p className="mt-3 text-sm font-semibold text-gray-900">
          {tontine?.name ?? 'Tontine'}
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
              : 'Inconnu'
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
              : ''
          }
        />
        <InfoRow
          icon={Users}
          label="Nombre de membres"
          value={String(tontine?.members?.length ?? 0)}
        />
        <InfoRow
          icon={Users}
          label="Montant de cotisation"
          value={
            tontine?.contributionAmount
              ? `${Number(tontine.contributionAmount).toLocaleString('fr-FR')} ${tontine.currency ?? 'FCFA'}`
              : ''
          }
        />
        <InfoRow icon={Users} label="Fréquence" value={tontine?.frequency ?? ''} />
        <InfoRow
          icon={Users}
          label="Prochain tour"
          value={
            tontine?.nextContributionAt
              ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR')
              : ''
          }
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            Membres ({tontine?.members?.length ?? 0})
          </p>
        </div>
        <div className="mt-1 divide-y divide-gray-50">
          {(tontine?.members ?? []).map((m) => {
            const name = m.user
              ? `${m.user.prenom ?? ''} ${m.user.nom ?? ''}`.trim() || `Membre ${m.id}`
              : `Membre ${m.id}`;
            return (
              <MemberRow key={m.id} member={{ id: m.id, name, role: m.role }} />
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Fichiers partagés</p>
        </div>
        <div className="mt-2 flex items-center justify-center rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400">Aucun fichier partagé</p>
        </div>
      </div>
    </aside>
  );
}

export default function TontineChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSingleTontine = !!id;

  const { data: tontine, isLoading, error } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const currentUserId = undefined;

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

  if (isSingleTontine && id) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex h-[calc(100vh-140px)] min-h-0 min-w-0 gap-4 overflow-hidden">
          <ChatArea
            tontineId={id}
            tontine={tontine}
            currentUserId={currentUserId}
            onBack={() => navigate('/dashboard/tontines')}
          />
          <TontineAboutPanel tontine={tontine} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex h-[calc(100vh-140px)] min-h-0 min-w-0 items-center justify-center">
        <p className="text-sm text-gray-400">Sélectionnez une tontine pour accéder au chat</p>
      </div>
    </DashboardLayout>
  );
}
