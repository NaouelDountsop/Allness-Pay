import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@afrilinkpay/shared';
import { useTranslation } from 'react-i18next';
import { Sparkles, CreditCard, Users, LifeBuoy, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
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
import { usePreferences } from '@/hooks/use-preferences';

function SettingCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-allness-green/10 px-3 py-1 text-[11px] font-semibold text-allness-green">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{checked ? t('settings.activated') : t('settings.deactivated')}</span>
        <Toggle checked={checked} onChange={onCheckedChange} />
      </div>
    </div>
  );
}

interface PaymentMethod {
  id: string;
  type: string;
  identifier: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const fullName = useMemo(
    () => (profile ? `${profile.prenom} ${profile.nom}` : t('settings.defaultUser')),
    [profile, t],
  );

  // --- État des pop-ups ---
  const [securityOpen, setSecurityOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const [tontinePrefsOpen, setTontinePrefsOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // --- Sécurité ---
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // --- Notifications ---
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [notifDeposit, setNotifDeposit] = useState(true);
  const [notifTontineReminder, setNotifTontineReminder] = useState(true);
  const [notifInvitation, setNotifInvitation] = useState(true);
  const [notifLatePayment, setNotifLatePayment] = useState(true);

  // --- Préférences de compte ---
  const [currency, setCurrency] = useState('CFA');
  const { language, theme, setLanguage, setTheme } = usePreferences();
  const [timezone, setTimezone] = useState('Afrique/Douala (GMT+1)');

  // --- Moyens de paiement ---
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'Orange Money', identifier: '+237 6XX XX XX XX' },
  ]);
  const [newMethodType, setNewMethodType] = useState('Orange Money');
  const [newMethodIdentifier, setNewMethodIdentifier] = useState('');

  const addPaymentMethod = () => {
    if (!newMethodIdentifier.trim()) return;
    setPaymentMethods((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: newMethodType, identifier: newMethodIdentifier },
    ]);
    setNewMethodIdentifier('');
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Préférences tontine ---
  const [reminderDays, setReminderDays] = useState('2');
  const [profileVisibleToMembers, setProfileVisibleToMembers] = useState(true);

  // --- Confidentialité ---
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <aside className="space-y-6 xl:w-1/3">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-allness-dark text-3xl font-semibold text-white">
                  {fullName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-allness-orange">
                    {t('settings.title')}
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-gray-900">
                    {t('settings.accountTitle')}
                  </h1>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-3xl bg-allness-orange/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    {t('settings.emailPrincipal')}
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-900">{profile?.email ?? '-'}</p>
                </div>
                <div className="rounded-3xl bg-allness-green/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{t('settings.twoFA')}</p>
                  <p className="mt-3 text-sm font-medium text-gray-900">
                    {twoFaEnabled ? t('settings.enabled') : t('settings.disabled')}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-4 h-4 text-allness-orange" />
                  <p className="text-sm font-semibold text-gray-900">{t('settings.quickPrefs')}</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.language')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{language === 'fr' ? t('settings.french') : t('settings.english')}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.currency')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{currency}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6 xl:w-2/3">
            <div className="grid gap-4 lg:grid-cols-1">
              <SettingCard
                title={t('settings.security')}
                description={t('settings.securityDescription')}
                badge={twoFaEnabled ? t('settings.enabled') : t('settings.disabled')}
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      {t('settings.authentication')}
                    </p>
                    <p className="mt-2 text-sm font-medium text-allness-green">
                      {twoFaEnabled ? t('settings.twoFAEnabled') : t('settings.twoFADisabled')}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      {t('settings.pinTransactionnel')}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {pinEnabled ? t('settings.configured') : t('settings.notConfigured')}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      {t('settings.loginHistory')}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {t('settings.lastLogin')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full"
                    onClick={() => setSecurityOpen(true)}
                  >
                    {t('settings.manageSecurity')}
                  </Button>
                </div>
              </SettingCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SettingCard
                title={t('settings.notificationsPrefs')}
                description={t('settings.notificationsDescription')}
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.email')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {emailNotifs ? t('settings.activatedShort') : t('settings.deactivatedShort')}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.sms')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {smsNotifs ? t('settings.activatedShort') : t('settings.deactivatedShort')}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.push')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {pushNotifs ? t('settings.activatedShort') : t('settings.deactivatedShort')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full"
                    onClick={() => setNotificationsOpen(true)}
                  >
                    {t('settings.modifyNotifications')}
                  </Button>
                </div>
              </SettingCard>

              <SettingCard
                title={t('settings.accountPrefs')}
                description={t('settings.accountPrefsDescription')}
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.currency')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{currency}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.language')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{language === 'fr' ? t('settings.french') : t('settings.english')}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{t('settings.theme')}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{theme === 'light' ? t('settings.light') : t('settings.dark')}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full"
                    onClick={() => setPreferencesOpen(true)}
                  >
                    {t('settings.modifyPrefs')}
                  </Button>
                </div>
              </SettingCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SettingCard
                title={t('settings.paymentMethods')}
                description={t('settings.paymentMethodsDescription')}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-3xl bg-gray-50 p-4">
                    <CreditCard className="w-4 h-4 text-allness-orange shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        {t('settings.linkedMethods')}
                      </p>
                      <p className="mt-2 text-sm font-medium text-brand-text dark:text-brand-text">
                        {paymentMethods.length} {paymentMethods.length > 1 ? t('settings.paymentMethodsPlural') : t('settings.paymentMethodsSingular')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full"
                    onClick={() => setPaymentMethodsOpen(true)}
                  >
                    {t('settings.managePaymentMethods')}
                  </Button>
                </div>
              </SettingCard>

              <SettingCard
                title={t('settings.tontinePrefs')}
                description={t('settings.tontinePrefsDescription')}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-3xl bg-gray-50 p-4">
                    <Users className="w-4 h-4 text-allness-green shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        {t('settings.reminderBeforeTurn')}
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {reminderDays} {t('settings.daysBefore')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full"
                    onClick={() => setTontinePrefsOpen(true)}
                  >
                    {t('settings.modifyTontinePrefs')}
                  </Button>
                </div>
              </SettingCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SettingCard
                title={t('settings.support')}
                description={t('settings.supportDescription')}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-3xl bg-gray-50 p-4">
                    <LifeBuoy className="w-4 h-4 text-allness-orange shrink-0" />
                    <p className="text-sm font-medium text-gray-900">{t('settings.needHelp')}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="outline" size="sm" className="rounded-full w-full">
                      {t('settings.contactSupport')}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full w-full">
                      {t('settings.viewFAQ')}
                    </Button>
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title={t('settings.privacy')}
                description={t('settings.privacyDescription')}
              >
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="rounded-full w-full">
                    {t('settings.exportData')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    {t('settings.deleteAccount')}
                  </Button>
                </div>
              </SettingCard>
            </div>
          </main>
        </div>
      </div>

      {/* --- Pop-up : Sécurité --- */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setSecurityOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.manageSecurityTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.manageSecurityDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ToggleRow
              label={t('settings.twoFALabel')}
              hint={t('settings.twoFAHint')}
              checked={twoFaEnabled}
              onCheckedChange={setTwoFaEnabled}
            />
            <ToggleRow
              label={t('settings.biometricLabel')}
              hint={t('settings.biometricHint')}
              checked={biometricEnabled}
              onCheckedChange={setBiometricEnabled}
            />

            <div className="space-y-2">
              <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">{t('settings.pinLabel')}</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                onChange={() => setPinEnabled(true)}
              />
              <p className="text-xs text-gray-400">{t('settings.pinHint')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button
              onClick={() => {
                setSecurityOpen(false);
              }}
            >
              {t('settings.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Notifications --- */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setNotificationsOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.modifyNotificationsTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.modifyNotificationsDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {t('settings.channels')}
            </p>
            <ToggleRow
              label={t('settings.emailNotifs')}
              hint={t('settings.emailNotifsHint')}
              checked={emailNotifs}
              onCheckedChange={setEmailNotifs}
            />
            <ToggleRow
              label={t('settings.smsNotifs')}
              hint={t('settings.smsNotifsHint')}
              checked={smsNotifs}
              onCheckedChange={setSmsNotifs}
            />
            <ToggleRow
              label={t('settings.pushNotifs')}
              hint={t('settings.pushNotifsHint')}
              checked={pushNotifs}
              onCheckedChange={setPushNotifs}
            />

            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {t('settings.eventTypes')}
            </p>
            <ToggleRow
              label={t('settings.depositReceived')}
              hint={t('settings.depositReceivedHint')}
              checked={notifDeposit}
              onCheckedChange={setNotifDeposit}
            />
            <ToggleRow
              label={t('settings.tontineReminder')}
              hint={t('settings.tontineReminderHint')}
              checked={notifTontineReminder}
              onCheckedChange={setNotifTontineReminder}
            />
            <ToggleRow
              label={t('settings.invitationReceived')}
              hint={t('settings.invitationReceivedHint')}
              checked={notifInvitation}
              onCheckedChange={setNotifInvitation}
            />
            <ToggleRow
              label={t('settings.latePayment')}
              hint={t('settings.latePaymentHint')}
              checked={notifLatePayment}
              onCheckedChange={setNotifLatePayment}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button
              onClick={() => {
                setNotificationsOpen(false);
              }}
            >
              {t('settings.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Préférences de compte --- */}
      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setPreferencesOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.modifyPrefsTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.modifyPrefsDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t('settings.currency')}</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="CFA">CFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="fr">{t('settings.french')}</option>
                <option value="en">{t('settings.english')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.theme')}</Label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="light">{t('settings.light')}</option>
                <option value="dark">{t('settings.dark')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('settings.timezone')}</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="Afrique/Douala (GMT+1)">Afrique/Douala (GMT+1)</option>
                <option value="Europe/Paris (GMT+1/+2)">Europe/Paris (GMT+1/+2)</option>
                <option value="Afrique/Abidjan (GMT+0)">Afrique/Abidjan (GMT+0)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreferencesOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button
              onClick={() => {
                setPreferencesOpen(false);
              }}
            >
              {t('settings.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Moyens de paiement --- */}
      <Dialog open={paymentMethodsOpen} onOpenChange={setPaymentMethodsOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setPaymentMethodsOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.paymentMethodsTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.paymentMethodsDialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400">{t('settings.noPaymentMethods')}</p>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method.type}</p>
                    <p className="text-xs text-gray-500">{method.identifier}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(method.id)}
                    className="rounded-full p-2 text-brand-red hover:bg-brand-bg-red-light dark:hover:bg-brand-bg-red-light"
                    aria-label={t('settings.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {t('settings.addPaymentMethod')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="method-type">{t('settings.methodType')}</Label>
                <select
                  id="method-type"
                  value={newMethodType}
                  onChange={(e) => setNewMethodType(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Carte bancaire">{t('settings.creditCard')}</option>
                  <option value="Compte bancaire">{t('settings.bankAccount')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method-identifier">{t('settings.methodIdentifier')}</Label>
                <Input
                  id="method-identifier"
                  value={newMethodIdentifier}
                  onChange={(e) => setNewMethodIdentifier(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={addPaymentMethod}>
              <Plus className="mr-2 h-4 w-4" />
              {t('settings.add')}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setPaymentMethodsOpen(false)}>{t('settings.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Préférences tontines --- */}
      <Dialog open={tontinePrefsOpen} onOpenChange={setTontinePrefsOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setTontinePrefsOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.tontinePrefsDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.tontinePrefsDialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-days">{t('settings.reminderDaysLabel')}</Label>
              <select
                id="reminder-days"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900"
              >
                <option value="1">{t('settings.reminder1')}</option>
                <option value="2">{t('settings.reminder2')}</option>
                <option value="3">{t('settings.reminder3')}</option>
                <option value="7">{t('settings.reminder7')}</option>
              </select>
            </div>

            <ToggleRow
              label={t('settings.visibleToMembers')}
              hint={t('settings.visibleToMembersHint')}
              checked={profileVisibleToMembers}
              onCheckedChange={setProfileVisibleToMembers}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTontinePrefsOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button
              onClick={() => {
                setTontinePrefsOpen(false);
              }}
            >
              {t('settings.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Pop-up : Suppression du compte --- */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setDeleteAccountOpen} />
          <DialogHeader>
            <DialogTitle>{t('settings.deleteConfirm')}</DialogTitle>
            <DialogDescription>
              {t('settings.deleteDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              {t('settings.deleteHint')}
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={deleteConfirmText !== 'SUPPRIMER'}
              onClick={() => {
                setDeleteAccountOpen(false);
              }}
            >
              {t('settings.deletePermanent')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
