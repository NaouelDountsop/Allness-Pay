import { useNavigate } from 'react-router-dom';
import { Zap, Droplet, Wifi, Tv, Smartphone, Phone, Star, ChevronRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/mock/payments-data';

const iconMap = {
  electricity: Zap,
  water: Droplet,
  internet: Wifi,
  tv: Tv,
  airtime: Smartphone,
  phone: Phone,
};

const colorMap = {
  electricity: 'bg-yellow-50 text-yellow-600',
  water: 'bg-blue-50 text-blue-600',
  internet: 'bg-cyan-50 text-cyan-600',
  tv: 'bg-red-50 text-red-600',
  airtime: 'bg-green-50 text-green-600',
  phone: 'bg-purple-50 text-purple-600',
};

interface ServiceCategoriesGridProps {
  categories: ServiceCategory[];
  onSelect?: (key: string) => void;
  selectedKey?: string | null;
}

export function ServiceCategoriesGrid({ categories, onSelect, selectedKey }: ServiceCategoriesGridProps) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-allness-dark">Nos services</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isSelected = selectedKey === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                if (onSelect) {
                  onSelect(cat.key);
                } else {
                  navigate(`/dashboard/payments/${cat.key}`);
                }
              }}
              className={`relative rounded-xl border p-4 flex items-center gap-3 hover:shadow-sm transition-all text-left ${
                isSelected
                  ? 'border-allness-green bg-allness-green/5'
                  : 'border-gray-100 bg-white hover:border-allness-green/40'
              }`}
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
