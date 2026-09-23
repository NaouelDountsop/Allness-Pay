import { useTranslation } from 'react-i18next';

export function HowToPay() {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      title: t('payments.howToPay.step1Title'),
      description: t('payments.howToPay.step1Description'),
    },
    {
      number: 2,
      title: t('payments.howToPay.step2Title'),
      description: t('payments.howToPay.step2Description'),
    },
    {
      number: 3,
      title: t('payments.howToPay.step3Title'),
      description: t('payments.howToPay.step3Description'),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('payments.howToPay.title')}</h3>
      <div className="relative">
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />
        <ul className="space-y-5">
          {steps.map((step) => (
            <li key={step.number} className="flex gap-3 relative">
              <span className="w-7 h-7 rounded-full bg-allness-orange text-white text-xs font-semibold flex items-center justify-center shrink-0 z-10">
                {step.number}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-800">{step.title}</p>
                <p className="text-[11px] text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
