import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-gray-900">{value || t('profile.notSpecified')}</p>
    </div>
  );
}

const MAX_AVATAR_SIZE_MB = 5;

export default function ProfilePage() {
  const { t } = useTranslation();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const queryClient = useQueryClient();

  const fullName = useMemo(
    () => (profile ? `${profile.prenom} ${profile.nom}` : t('profile.defaultName')),
    [profile, t],
  );

  const initials = useMemo(() => {
    if (!profile) return 'UA';
    return `${profile.prenom?.[0] ?? 'U'}${profile.nom?.[0] ?? 'A'}`.toUpperCase();
  }, [profile]);

  // --- État des pop-ups ---
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  // --- État local des formulaires ---
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

  // Sync form state when profile loads/updates
  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom ?? '');
      setNom(profile.nom ?? '');
      setDateNaissance(profile.datenaissance ?? '');
      setSexe(profile.sexe ?? '');
      setProfession(profile.profession ?? '');
      setAdresse(profile.adresse ?? '');
      setEmail(profile.email ?? '');
      setTelephone(profile.telephone ?? '');
      setVille(profile.ville ?? '');
      setPays(profile.pays ?? '');
    }
  }, [profile]);

  const invalidateProfile = () => queryClient.invalidateQueries({ queryKey: ['profile'] });

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await userService.update(profile.idutilisateur, {
        prenom,
        nom,
        datenaissance: dateNaissance,
        sexe,
        profession,
        adresse,
      });
      await invalidateProfile();
      setProfileSuccess(true);
      setTimeout(() => {
        setEditProfileOpen(false);
        setProfileSuccess(false);
      }, 1200);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveContact = async () => {
    if (!profile) return;
    setSavingContact(true);
    setContactError(null);
    setContactSuccess(false);
    try {
      await userService.update(profile.idutilisateur, {
        email,
        telephone,
        ville,
        pays,
      });
      await invalidateProfile();
      setContactSuccess(true);
      setTimeout(() => {
        setEditContactOpen(false);
        setContactSuccess(false);
      }, 1200);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSavingContact(false);
    }
  };

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
      setAvatarError(t('profile.imageFileError'));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setAvatarError(t('profile.imageSizeError', { size: MAX_AVATAR_SIZE_MB }));
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
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-allness-orange text-white shadow-sm hover:bg-allness-orange/90"
                    aria-label={t('profile.changePhotoAria')}
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
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-allness-orange">
                    {t('profile.title')}
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-allness-dark truncate">
                    {fullName}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {profile?.profession ?? t('profile.defaultProfession')}
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
                  {t('profile.deletePhoto')}
                </button>
              ) : null}

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-allness-green/10 bg-allness-green/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{t('profile.status')}</p>
                      <p className="mt-2 text-lg font-semibold text-allness-dark">
                        {profile?.statut || t('profile.active')}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-allness-green/10 px-3 py-1 text-xs font-semibold text-allness-green">
                      <CheckCircle2 className="w-4 h-4" /> {t('profile.verified')}
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
                    {t('profile.editProfile')}
                  </Button>
                  <Button className="w-full rounded-full" variant="outline" size="sm">
                    {t('profile.viewDetails')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">{t('profile.contactInfo')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditContactOpen(true)}
                  >
                    {t('profile.modify')}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-allness-orange" />
                    <span className="text-sm">{profile?.email ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-allness-orange" />
                    <span className="text-sm">{profile?.telephone ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-allness-orange" />
                    <span className="text-sm">
                      {profile ? `${profile.ville}, ${profile.pays}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">{t('profile.activity')}</p>
                  <span className="text-xs text-gray-400">{t('profile.recentUpdate')}</span>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('profile.registration')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {profile?.dateinscription ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      {t('profile.lastModified')}
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
                    {t('profile.userData')}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-allness-dark">
                    {t('profile.personalInfo')}
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => {
                    const rows = [
                      ['Champ', 'Valeur'],
                      ['Nom complet', fullName],
                      ['Date de naissance', profile?.datenaissance ?? '—'],
                      ['Sexe', profile?.sexe ?? '—'],
                      ['Profession', profile?.profession ?? '—'],
                      ['Adresse', profile?.adresse ?? '—'],
                      ['Email', profile?.email ?? '—'],
                      ['Téléphone', profile?.telephone ?? '—'],
                      ['Ville', profile?.ville ?? '—'],
                      ['Pays', profile?.pays ?? '—'],
                      ['Statut', profile?.statut ?? '—'],
                    ];
                    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
                    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `profil_${fullName.replace(/\s+/g, '_')}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  {t('profile.exportPdf')}
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileField label={t('profile.fullName')} value={fullName} />
                <ProfileField label={t('profile.dateOfBirth')} value={profile?.datenaissance ?? '-'} />
                <ProfileField label={t('profile.gender')} value={profile?.sexe ?? '-'} />
                <ProfileField label={t('profile.profession')} value={profile?.profession ?? '-'} />
                <ProfileField label={t('profile.address')} value={profile?.adresse ?? '-'} />
                <ProfileField label={t('profile.accountStatus')} value={profile?.statut ?? '-'} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t('profile.myOptions')}</p>
                  <p className="text-xs text-gray-500">{t('profile.optionsDescription')}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  {t('profile.viewActivity')}
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-allness-orange/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-4 h-4 text-allness-orange" />
                    <p className="text-sm font-semibold text-allness-dark">{t('profile.profileCardTitle')}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('profile.profileCardDescription')}
                  </p>
                </div>
                <div className="rounded-3xl bg-allness-green/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-4 h-4 text-allness-green" />
                    <p className="text-sm font-semibold text-allness-dark">{t('profile.security')}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('profile.securityDescription')}
                  </p>
                </div>
                <div className="rounded-3xl bg-allness-dark/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDays className="w-4 h-4 text-allness-dark" />
                    <p className="text-sm font-semibold text-allness-dark">{t('profile.notifications')}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('profile.notificationsDescription')}
                  </p>
                </div>
                <div className="rounded-3xl bg-gray-50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-4 h-4 text-allness-orange" />
                    <p className="text-sm font-semibold text-allness-dark">{t('profile.preferences')}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('profile.preferencesDescription')}
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
            <DialogTitle>{t('profile.editProfileTitle')}</DialogTitle>
            <DialogDescription>
              {t('profile.editProfileDescription')}
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
                {t('profile.changePhoto')}
              </Button>
              {avatarError ? <p className="text-xs text-red-500">{avatarError}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prenom">{t('profile.firstName')}</Label>
              <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">{t('profile.lastName')}</Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-naissance">{t('profile.dateOfBirth')}</Label>
              <Input
                id="date-naissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexe">{t('profile.gender')}</Label>
              <select
                id="sexe"
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
              >
                <option value="">{t('profile.genderNotSpecified')}</option>
                <option value="Femme">{t('profile.female')}</option>
                <option value="Homme">{t('profile.male')}</option>
                <option value="Autre">{t('profile.other')}</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profession">{t('profile.profession')}</Label>
              <Input
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">{t('profile.address')}</Label>
              <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? '...' : profileSuccess ? '✓' : t('profile.save')}
            </Button>
          </DialogFooter>
          {profileError && <p className="text-xs text-red-500 mt-2">{profileError}</p>}
          {profileSuccess && <p className="text-xs text-allness-green mt-2">Profil mis à jour</p>}
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Modifier les coordonnées --- */}
      <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setEditContactOpen} />
          <DialogHeader>
            <DialogTitle>{t('profile.editContactTitle')}</DialogTitle>
            <DialogDescription>
              {t('profile.editContactDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">{t('profile.phone')}</Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ville">{t('profile.city')}</Label>
                <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pays">{t('profile.country')}</Label>
                <Input id="pays" value={pays} onChange={(e) => setPays(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button
              onClick={handleSaveContact}
              disabled={savingContact}
            >
              {savingContact ? '...' : contactSuccess ? '✓' : t('profile.save')}
            </Button>
          </DialogFooter>
          {contactError && <p className="text-xs text-red-500 mt-2">{contactError}</p>}
          {contactSuccess && <p className="text-xs text-allness-green mt-2">Coordonnées mises à jour</p>}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
