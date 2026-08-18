import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@afrilinkpay/shared';
import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
  CalendarDays,
  Briefcase,
  ShieldCheck,
  Camera,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { userService } from '@/lib/api/user.service';

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-gray-900">{value || 'Non renseigné'}</p>
    </div>
  );
}

const MAX_AVATAR_SIZE_MB = 5;

export default function ProfilePage() {
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const fullName = useMemo(
    () => (profile ? `${profile.prenom} ${profile.nom}` : 'Utilisateur Allness'),
    [profile],
  );

  const initials = useMemo(() => {
    if (!profile) return 'UA';
    return `${profile.prenom?.[0] ?? 'U'}${profile.nom?.[0] ?? 'A'}`.toUpperCase();
  }, [profile]);

  // --- État des pop-ups ---
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);

  // --- État local des formulaires (initialisé depuis le profil, à brancher sur userService) ---
  const [prenom, setPrenom] = useState(profile?.prenom ?? '');
  const [nom, setNom] = useState(profile?.nom ?? '');
  const [dateNaissance, setDateNaissance] = useState(profile?.datenaissance ?? '');
  const [sexe, setSexe] = useState(profile?.sexe ?? '');
  const [profession, setProfession] = useState(profile?.profession ?? '');
  const [adresse, setAdresse] = useState(profile?.adresse ?? '');

  const [email, setEmail] = useState(profile?.email ?? '');
  const [telephone, setTelephone] = useState(profile?.telephone ?? '');
  const [ville, setVille] = useState(profile?.ville ?? '');
  const [pays, setPays] = useState(profile?.pays ?? '');

  // --- Photo de profil ---
  // NB: si votre UserProfile expose déjà un champ avatar (ex: avatarUrl), remplacez
  // cette valeur initiale par `profile?.avatarUrl` pour précharger la photo existante.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Veuillez sélectionner un fichier image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setAvatarError(`L'image doit faire moins de ${MAX_AVATAR_SIZE_MB} Mo.`);
      return;
    }

    setAvatarError(null);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    // TODO: envoyer immédiatement le fichier au backend, par ex :
    // const formData = new FormData();
    // formData.append("avatar", file);
    // await userService.updateAvatar(formData);
  };

  const removeAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // TODO: brancher sur userService.removeAvatar()
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <aside className="space-y-6 xl:w-2/5">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar initials={initials} src={avatarPreview ?? undefined} size="lg" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-afrilink-orange text-white shadow-sm hover:bg-afrilink-orange/90"
                    aria-label="Changer la photo de profil"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-afrilink-orange">
                    Mon profil
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-afrilink-dark truncate">
                    {fullName}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {profile?.profession ?? 'Client Allness'}
                  </p>
                </div>
              </div>

              {avatarError ? <p className="mt-3 text-xs text-red-500">{avatarError}</p> : null}
              {avatarPreview ? (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer la photo
                </button>
              ) : null}

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-afrilink-green/10 bg-afrilink-green/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Statut</p>
                      <p className="mt-2 text-lg font-semibold text-afrilink-dark">
                        {profile?.statut || 'Actif'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-afrilink-green/10 px-3 py-1 text-xs font-semibold text-afrilink-green">
                      <CheckCircle2 className="w-4 h-4" /> Vérifié
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className="w-full rounded-full"
                    variant="default"
                    size="sm"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    Modifier le profil
                  </Button>
                  <Button className="w-full rounded-full" variant="outline" size="sm">
                    Voir les détails
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">Coordonnées</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditContactOpen(true)}
                  >
                    Modifier
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">{profile?.email ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">{profile?.telephone ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">
                      {profile ? `${profile.ville}, ${profile.pays}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">Activité</p>
                  <span className="text-xs text-gray-400">Mise à jour récente</span>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Inscription</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {profile?.dateinscription ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Dernière modification
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {profile?.datemodification ?? '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6 xl:w-3/5">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    Données utilisateur
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-afrilink-dark">
                    Informations personnelles
                  </h2>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full px-4">
                  Exporter le PDF
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileField label="Nom complet" value={fullName} />
                <ProfileField label="Date de naissance" value={profile?.datenaissance ?? '-'} />
                <ProfileField label="Sexe" value={profile?.sexe ?? '-'} />
                <ProfileField label="Profession" value={profile?.profession ?? '-'} />
                <ProfileField label="Adresse" value={profile?.adresse ?? '-'} />
                <ProfileField label="Statut compte" value={profile?.statut ?? '-'} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mes options</p>
                  <p className="text-xs text-gray-500">Gestion des accès et des préférences</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Voir l'activité
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-afrilink-orange/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-4 h-4 text-afrilink-orange" />
                    <p className="text-sm font-semibold text-afrilink-dark">Profil</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Modifiez vos informations personnelles et votre avatar.
                  </p>
                </div>
                <div className="rounded-3xl bg-afrilink-green/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-4 h-4 text-afrilink-green" />
                    <p className="text-sm font-semibold text-afrilink-dark">Sécurité</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Activez l’authentification à deux facteurs et gérez vos accès.
                  </p>
                </div>
                <div className="rounded-3xl bg-afrilink-dark/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDays className="w-4 h-4 text-afrilink-dark" />
                    <p className="text-sm font-semibold text-afrilink-dark">Notifications</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Recevez les alertes de transactions et les rappels.
                  </p>
                </div>
                <div className="rounded-3xl bg-gray-50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-4 h-4 text-afrilink-orange" />
                    <p className="text-sm font-semibold text-afrilink-dark">Préférences</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Choisissez votre devise et vos options d’interface.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* --- Pop-up : Modifier le profil --- */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setEditProfileOpen} />
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles et votre photo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 mb-2">
            <Avatar initials={initials} src={avatarPreview ?? undefined} size="lg" />
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Changer la photo
              </Button>
              {avatarError ? <p className="text-xs text-red-500">{avatarError}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-naissance">Date de naissance</Label>
              <Input
                id="date-naissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe</Label>
              <select
                id="sexe"
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="">Non renseigné</option>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                // TODO: brancher sur userService.updateProfile({ prenom, nom, datenaissance: dateNaissance, sexe, profession, adresse })
                // Si avatarFile est défini et n'a pas encore été envoyé, l'inclure ici via FormData.
                setEditProfileOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Modifier les coordonnées --- */}
      <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setEditContactOpen} />
          <DialogHeader>
            <DialogTitle>Modifier mes coordonnées</DialogTitle>
            <DialogDescription>
              Mettez à jour votre email, téléphone et localisation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pays">Pays</Label>
                <Input id="pays" value={pays} onChange={(e) => setPays(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                // TODO: brancher sur userService.updateProfile({ email, telephone, ville, pays })
                setEditContactOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
