import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Droplet, Phone, Tv, GraduationCap, Bus, Star, ChevronRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/mock/payments-data';

const iconMap = {
  electricity: Zap,
  water: Droplet,
  telecom: Phone,
  tv: Tv,
  education: GraduationCap,
  transport: Bus,
};

const colorMap = {
  electricity: 'bg-yellow-50 text-yellow-600',
  water: 'bg-blue-50 text-blue-600',
  telecom: 'bg-purple-50 text-purple-600',
  tv: 'bg-pink-50 text-pink-600',
  education: 'bg-green-50 text-green-600',
  transport: 'bg-orange-50 text-orange-600',
};

interface ServiceCategoriesGridProps {
  categories: ServiceCategory[];
}

export function ServiceCategoriesGrid({ categories }: ServiceCategoriesGridProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-allness-dark">{t('payments.categories.title')}</h3>
        <button
          onClick={() => {}}
          className="text-xs text-allness-green font-medium inline-flex items-center gap-1"
        >
          {t('payments.categories.viewAll')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.key}
              onClick={() => navigate(`/dashboard/payments/${cat.key}`)}
              className="relative rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3 hover:border-allness-green/40 hover:shadow-sm transition-all text-left"
            >
              <span
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[cat.icon]}`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                  {cat.favorite && (
                    <Star className="w-3 h-3 text-allness-orange fill-allness-orange" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{cat.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
