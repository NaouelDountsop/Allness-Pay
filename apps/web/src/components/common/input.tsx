import { forwardRef, InputHTMLAttributes } from "react";
import { Input as ShadInput } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, icon: Icon, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
          )}
          <ShadInput
            ref={ref}
            className={`${Icon ? "pl-9" : ""} h-11 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:border-afrilink-orange focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange ${
              error ? "border-red-500" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
AppInput.displayName = "AppInput";
