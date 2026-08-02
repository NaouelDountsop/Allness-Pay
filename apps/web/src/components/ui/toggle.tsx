export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${
        checked ? "bg-afrilink-green" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[19px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
