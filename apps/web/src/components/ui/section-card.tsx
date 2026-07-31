import type { LucideIcon } from "lucide-react";

export function SectionCard({
  title,
  icon: Icon,
  tone = "default",
  children,
  className = "",
}: {
  title?: string;
  icon?: LucideIcon;
  tone?: "default" | "orange" | "green";
  children: React.ReactNode;
  className?: string;
}) {
  const toneStyles = {
    default: "bg-white border-gray-100",
    orange: "bg-white border-afrilink-orange/30",
    green: "bg-green-50/60 border-green-100",
  };

  return (
    <div className={`rounded-xl border ${toneStyles[tone]} p-5 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-4 h-4 text-afrilink-orange" />}
          <p className="text-xs font-bold uppercase tracking-wide text-afrilink-dark">
            {title}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-afrilink-dark font-medium">{value}</p>
    </div>
  );
}
