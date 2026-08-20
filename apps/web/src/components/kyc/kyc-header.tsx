interface KycHeaderProps {
  title: string;
  subtitle?: string;
}

export function KycHeader({ title, subtitle }: KycHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-allness-dark mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
