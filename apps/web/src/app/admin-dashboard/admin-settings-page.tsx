import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Info } from 'lucide-react';
import { AdminLayout } from '@/components/admin-dashboard/admin-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';

function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold text-brand-text">{title}</p>
        <p className="mt-1 text-xs text-brand-text-secondary">{description}</p>
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
  return (
    <div className="flex items-center justify-between rounded-2xl bg-brand-hover p-4">
      <div>
        <p className="text-sm font-medium text-brand-text">{label}</p>
        <p className="text-xs text-brand-text-secondary">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-brand-text-secondary">{checked ? 'Activé' : 'Désactivé'}</span>
        <Toggle checked={checked} onChange={onCheckedChange} />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();

  const [platformName, setPlatformName] = useState('AllnessPay');
  const [supportEmail, setSupportEmail] = useState('support@afrilinkpay.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const [twoFaEnforced, setTwoFaEnforced] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [pinRequired, setPinRequired] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [kycAlerts, setKycAlerts] = useState(true);
  const [largeTransactionAlerts, setLargeTransactionAlerts] = useState(true);
  const [largeTransactionThreshold, setLargeTransactionThreshold] = useState('500000');
  const [failedTransactionAlerts, setFailedTransactionAlerts] = useState(true);

  const [defaultCurrency, setDefaultCurrency] = useState('XAF');
  const [mtnEnabled, setMtnEnabled] = useState(true);
  const [orangeEnabled, setOrangeEnabled] = useState(true);
  const [waveEnabled, setWaveEnabled] = useState(false);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);

  const [kycRequiredForWithdrawal, setKycRequiredForWithdrawal] = useState(true);
  const [kycRequiredForTontine, setKycRequiredForTontine] = useState(false);
  const [autoApproveKyc, setAutoApproveKyc] = useState(false);

  const [maxMembersPerTontine, setMaxMembersPerTontine] = useState('50');
  const [minContribution, setMinContribution] = useState('5000');
  const [maxContribution, setMaxContribution] = useState('1000000');
  const [lateFeePercent, setLateFeePercent] = useState('5');
  const [gracePeriodDays, setGracePeriodDays] = useState('3');

  return (
    <AdminLayout active="parametres">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-allness-dark">{t('adminSettings.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('adminSettings.subtitle')}</p>
          </div>
          <button className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center gap-2">
            <Save className="w-4 h-4" />
            {t('adminSettings.saveAll')}
          </button>
        </div>

        <div className="space-y-6 max-w-3xl">
          <SettingCard
            title={t('adminSettings.platformConfig')}
            description={t('adminSettings.platformConfigDescription')}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t('adminSettings.platformName')}</Label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('adminSettings.supportEmail')}</Label>
                <Input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              <ToggleRow
                label={t('adminSettings.maintenanceMode')}
                hint={t('adminSettings.maintenanceModeHint')}
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
              <ToggleRow
                label={t('adminSettings.registrationOpen')}
                hint={t('adminSettings.registrationOpenHint')}
                checked={registrationOpen}
                onCheckedChange={setRegistrationOpen}
              />
            </div>
          </SettingCard>

          <SettingCard
            title={t('adminSettings.securitySettings')}
            description={t('adminSettings.securitySettingsDescription')}
          >
            <div className="space-y-3">
              <ToggleRow
                label={t('adminSettings.enforceTwoFa')}
                hint={t('adminSettings.enforceTwoFaHint')}
                checked={twoFaEnforced}
                onCheckedChange={setTwoFaEnforced}
              />
              <ToggleRow
                label={t('adminSettings.requirePin')}
                hint={t('adminSettings.requirePinHint')}
                checked={pinRequired}
                onCheckedChange={setPinRequired}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminSettings.passwordMinLength')}</Label>
                  <Input
                    type="number"
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminSettings.maxLoginAttempts')}</Label>
                  <Input
                    type="number"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminSettings.sessionTimeout')} (min)</Label>
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SettingCard>

          <SettingCard
            title={t('adminSettings.notificationSettings')}
            description={t('adminSettings.notificationSettingsDescription')}
          >
            <div className="space-y-3">
              <ToggleRow
                label={t('adminSettings.emailNotifications')}
                hint={t('adminSettings.emailNotificationsHint')}
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
              <ToggleRow
                label={t('adminSettings.smsNotifications')}
                hint={t('adminSettings.smsNotificationsHint')}
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
              <ToggleRow
                label={t('adminSettings.kycAlerts')}
                hint={t('adminSettings.kycAlertsHint')}
                checked={kycAlerts}
                onCheckedChange={setKycAlerts}
              />
              <ToggleRow
                label={t('adminSettings.largeTransactionAlerts')}
                hint={t('adminSettings.largeTransactionAlertsHint')}
                checked={largeTransactionAlerts}
                onCheckedChange={setLargeTransactionAlerts}
              />
              {largeTransactionAlerts && (
                <div className="max-w-xs">
                  <Label>{t('adminSettings.largeTransactionThreshold')} (FCFA)</Label>
                  <Input
                    type="number"
                    value={largeTransactionThreshold}
                    onChange={(e) => setLargeTransactionThreshold(e.target.value)}
                  />
                </div>
              )}
              <ToggleRow
                label={t('adminSettings.failedTransactionAlerts')}
                hint={t('adminSettings.failedTransactionAlertsHint')}
                checked={failedTransactionAlerts}
                onCheckedChange={setFailedTransactionAlerts}
              />
            </div>
          </SettingCard>

          <SettingCard
            title={t('adminSettings.paymentProviders')}
            description={t('adminSettings.paymentProvidersDescription')}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t('adminSettings.defaultCurrency')}</Label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange bg-white"
                >
                  <option value="XAF">XAF (FCFA)</option>
                  <option value="XOF">XOF (CFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <ToggleRow
                label="MTN Mobile Money"
                hint={t('adminSettings.mtnHint')}
                checked={mtnEnabled}
                onCheckedChange={setMtnEnabled}
              />
              <ToggleRow
                label="Orange Money"
                hint={t('adminSettings.orangeHint')}
                checked={orangeEnabled}
                onCheckedChange={setOrangeEnabled}
              />
              <ToggleRow
                label="Wave"
                hint={t('adminSettings.waveHint')}
                checked={waveEnabled}
                onCheckedChange={setWaveEnabled}
              />
              <ToggleRow
                label={t('adminSettings.bankTransfer')}
                hint={t('adminSettings.bankTransferHint')}
                checked={bankTransferEnabled}
                onCheckedChange={setBankTransferEnabled}
              />
            </div>
          </SettingCard>

          <SettingCard
            title={t('adminSettings.kycSettings')}
            description={t('adminSettings.kycSettingsDescription')}
          >
            <div className="space-y-3">
              <ToggleRow
                label={t('adminSettings.kycRequiredForWithdrawal')}
                hint={t('adminSettings.kycRequiredForWithdrawalHint')}
                checked={kycRequiredForWithdrawal}
                onCheckedChange={setKycRequiredForWithdrawal}
              />
              <ToggleRow
                label={t('adminSettings.kycRequiredForTontine')}
                hint={t('adminSettings.kycRequiredForTontineHint')}
                checked={kycRequiredForTontine}
                onCheckedChange={setKycRequiredForTontine}
              />
              <ToggleRow
                label={t('adminSettings.autoApproveKyc')}
                hint={t('adminSettings.autoApproveKycHint')}
                checked={autoApproveKyc}
                onCheckedChange={setAutoApproveKyc}
              />
            </div>
          </SettingCard>

          <SettingCard
            title={t('adminSettings.tontineSettings')}
            description={t('adminSettings.tontineSettingsDescription')}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminSettings.maxMembersPerTontine')}</Label>
                  <Input
                    type="number"
                    value={maxMembersPerTontine}
                    onChange={(e) => setMaxMembersPerTontine(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminSettings.minContribution')} (FCFA)</Label>
                  <Input
                    type="number"
                    value={minContribution}
                    onChange={(e) => setMinContribution(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminSettings.maxContribution')} (FCFA)</Label>
                  <Input
                    type="number"
                    value={maxContribution}
                    onChange={(e) => setMaxContribution(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminSettings.lateFeePercent')} (%)</Label>
                  <Input
                    type="number"
                    value={lateFeePercent}
                    onChange={(e) => setLateFeePercent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminSettings.gracePeriodDays')}</Label>
                  <Input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SettingCard>

          <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-200 p-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              {t('adminSettings.settingsInfo')}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
