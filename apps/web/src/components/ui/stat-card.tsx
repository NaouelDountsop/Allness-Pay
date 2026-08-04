import type { LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import type { BadgeTone } from "../../types";

interface StatCardProps {
  icon: LucideIcon;
  iconTone?: BadgeTone;
  label: string;
  value: string;
  tag?: { label: string; tone: BadgeTone };
  hint?: string;
  hintTone?: "green" | "gray";
}

const ICON_BG: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  gray: "bg-gray-100 text-gray-500",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({
  icon: Icon,
  iconTone = "green",
  label,
  value,
  tag,
  hint,
  hintTone = "gray",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1 min-w-[180px]">
      <div className="flex items-start justify-between mb-3">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${ICON_BG[iconTone]}`}>
          <Icon className="w-4.5 h-4.5" />
        </span>
        {tag && <Badge tone={tag.tone}>{tag.label}</Badge>}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-afrilink-dark">{value}</p>
      {hint && (
        <p className={`text-[11px] mt-1 ${hintTone === "green" ? "text-green-600" : "text-gray-400"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
