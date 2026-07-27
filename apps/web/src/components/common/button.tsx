import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline";
}

export function AppButton({
  loading,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: AppButtonProps) {
  const base =
    "w-full h-11 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors";
  const styles =
    variant === "primary"
      ? "bg-afrilink-green hover:bg-afrilink-greenHover text-white disabled:opacity-60"
      : "border border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
