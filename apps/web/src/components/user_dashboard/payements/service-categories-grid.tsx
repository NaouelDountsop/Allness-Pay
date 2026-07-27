import { useNavigate } from "react-router-dom";
import { Zap, Droplet, Phone, Tv, GraduationCap, Bus, Star } from "lucide-react";
import type { ServiceCategory } from "@/lib/mock/payments-data";

const iconMap = {
  electricity: Zap,
  water: Droplet,
  telecom: Phone,
  tv: Tv,
  education: GraduationCap,
  transport: Bus,
};

const colorMap = {
  electricity: "bg-yellow-50 text-yellow-600",
  water: "bg-blue-50 text-blue-600",
  telecom: "bg-purple-50 text-purple-600",
  tv: "bg-pink-50 text-pink-600",
  education: "bg-green-50 text-green-600",
  transport: "bg-orange-50 text-orange-600",
};

interface ServiceCategoriesGridProps {
  categories: ServiceCategory[];
}

export function ServiceCategoriesGrid({ categories }: ServiceCategoriesGridProps) {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-base font-semibold text-afrilink-dark mb-4">
        Catégories de services
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.key}
              onClick={() => navigate(`/dashboard/payments/${cat.key}`)}
              className="relative rounded-xl border border-gray-100 bg-white p-5 flex flex-col items-center gap-3 hover:border-afrilink-green/40 hover:shadow-sm transition-all"
            >
              {cat.favorite && (
                <Star className="w-3.5 h-3.5 text-afrilink-orange fill-afrilink-orange absolute top-3 right-3" />
              )}
              <span
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[cat.icon]}`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
