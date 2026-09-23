export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex items-center gap-6 border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative text-sm pb-3 pt-1 transition-colors ${
            active === tab
              ? 'text-allness-orange font-medium'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab}
          {active === tab && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-allness-orange rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
