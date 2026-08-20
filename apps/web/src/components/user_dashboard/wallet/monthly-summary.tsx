import { useMemo } from 'react';

interface TrendPoint {
  label: string; // ex: "Avr", "Mai", "Juin", "Juil"
  revenus: number;
  depenses: number;
  epargne: number;
  solde: number;
}

interface MonthlySummaryProps {
  month: string;
  incomePercent: number;
  expensePercent: number;
  netAmount: number;
  data: TrendPoint[];
}

const SERIES = [
  { key: 'revenus', label: 'Revenus', color: '#F5A623' },
  { key: 'depenses', label: 'Dépenses', color: '#F43F5E' },
  { key: 'epargne', label: 'Épargne', color: '#22D3EE' },
  { key: 'solde', label: 'Solde', color: '#6B7280' },
] as const;

const VIEW_W = 340;
const VIEW_H = 170;
const PAD_X = 10;
const PAD_TOP = 10;
const PAD_BOTTOM = 34;

function buildLinePath(pts: { x: number; y: number }[]) {
  const first = pts[0];
  if (pts.length < 2 || !first) return '';
  let d = `M ${first.x},${first.y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    if (!p) continue;
    d += ` L ${p.x},${p.y}`;
  }
  return d;
}

export function MonthlySummary({
  month,
  incomePercent,
  expensePercent,
  netAmount,
  data,
}: MonthlySummaryProps) {
  const { seriesPaths, seriesPoints, gridX, gridY, tickLabels } = useMemo(() => {
    if (data.length === 0) {
      return { seriesPaths: [], seriesPoints: [], gridX: [], gridY: [], tickLabels: [] };
    }

    const allValues = data.flatMap((d) => SERIES.map((s) => d[s.key]));
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const span = max - min || 1;

    const innerW = VIEW_W - PAD_X * 2;
    const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const xFor = (i: number) => PAD_X + step * i;
    const yFor = (val: number) => PAD_TOP + innerH - ((val - min) / span) * innerH;

    const seriesPaths = SERIES.map((s) => {
      const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d[s.key]) }));
      return { key: s.key, color: s.color, path: buildLinePath(pts) };
    });

    const seriesPoints = SERIES.map((s) => ({
      key: s.key,
      color: s.color,
      points: data.map((d, i) => ({ x: xFor(i), y: yFor(d[s.key]) })),
    }));

    const gridX = data.map((_, i) => xFor(i));
    const gridY = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD_TOP + innerH * t);
    const tickLabels = data.map((d, i) => ({ x: xFor(i), label: d.label }));

    return { seriesPaths, seriesPoints, gridX, gridY, tickLabels };
  }, [data]);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Résumé mensuel</h3>
        <span className="text-xs text-gray-400">{month}</span>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 font-medium text-gray-600">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-40" preserveAspectRatio="none">
        {/* Grille pointillée horizontale */}
        {gridY.map((y, i) => (
          <line
            key={`gy-${i}`}
            x1={PAD_X}
            x2={VIEW_W - PAD_X}
            y1={y}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {/* Grille pointillée verticale */}
        {gridX.map((x, i) => (
          <line
            key={`gx-${i}`}
            x1={x}
            x2={x}
            y1={PAD_TOP}
            y2={VIEW_H - PAD_BOTTOM}
            stroke="#E5E7EB"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {/* Courbes (segments droits) */}
        {seriesPaths.map(
          (s) =>
            s.path && (
              <path
                key={s.key}
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ),
        )}

        {/* Points */}
        {seriesPoints.map((s) =>
          s.points.map((p, i) => (
            <circle key={`${s.key}-${i}`} cx={p.x} cy={p.y} r={3} fill={s.color} />
          )),
        )}

        {/* Marqueurs d'axe en forme de pilule */}
        {tickLabels.map((t, i) => (
          <rect
            key={`tick-${i}`}
            x={t.x - 14}
            y={VIEW_H - PAD_BOTTOM + 10}
            width={28}
            height={6}
            rx={3}
            fill="#D1D5DB"
          />
        ))}
      </svg>

      {/* Labels des mois sous les pilules */}
      <div className="flex justify-between px-1 mt-1 mb-3">
        {tickLabels.map((t, i) => (
          <span key={i} className="text-[10px] text-gray-400">
            {t.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-allness-green font-semibold">+{incomePercent}%</span>
        <span className="text-gray-400 font-semibold">-{expensePercent}%</span>
      </div>

      <p className="text-sm font-semibold text-gray-800 mt-3">
        {new Intl.NumberFormat('fr-FR').format(netAmount)} FCFA
      </p>
    </div>
  );
}
