export function Avatar({
  initials,
  src,
  size = 'md',
}: {
  initials?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={initials ?? ''}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${sizes[size]} rounded-full bg-allness-dark text-white flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </span>
  );
}
