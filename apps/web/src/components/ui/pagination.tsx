export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange?: (page: number) => void;
}) {
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (page > 3) pages.push('...');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center justify-between pt-4">
      <button
        onClick={() => onChange?.(Math.max(1, page - 1))}
        className="text-xs text-gray-500 hover:text-afrilink-dark disabled:opacity-40"
        disabled={page === 1}
      >
        Précédent
      </button>
      <div className="flex items-center gap-1.5">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="text-xs text-gray-400 px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange?.(p)}
              className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center transition-colors ${
                p === page ? 'bg-afrilink-orange text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        onClick={() => onChange?.(Math.min(totalPages, page + 1))}
        className="text-xs text-gray-500 hover:text-afrilink-dark disabled:opacity-40"
        disabled={page === totalPages}
      >
        Suivant
      </button>
    </div>
  );
}
