interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function Logo({ variant = 'light', className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img src="/logo-afrilinkpay.svg" alt="AfrilinkPay" className="w-24 h-24 object-contain" />
      <span
        className={`text-2xl font-bold ${
          variant === 'light' ? 'text-white' : 'text-afrilink-dark'
        }`}
      >
        Afrilink <span className="text-afrilink-orange">Pay</span>
      </span>
    </div>
  );
}
