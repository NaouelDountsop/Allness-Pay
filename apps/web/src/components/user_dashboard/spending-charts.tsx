import { useMemo, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'lucide-react';

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

const SERIES_COLORS: Record<string, string> = {
  revenus: '#22C55E',
  depenses: '#F97316',
  epargne: '#3B82F6',
  solde: '#A855F7',
};

const VIEW_W = 340;
const VIEW_H = 190;
// Marges pensées pour laisser la place aux axes (flèche Y à gauche, flèche X en bas)
const PAD_LEFT = 18;
const PAD_RIGHT = 14;
const PAD_TOP = 14;
const PAD_BOTTOM = 18;

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
  const { t } = useTranslation();
  const arrowId = useId();

  const SERIES = useMemo(() => [
    { key: 'revenus', label: t('wallet.revenus'), color: SERIES_COLORS.revenus },
    { key: 'depenses', label: t('wallet.depenses'), color: SERIES_COLORS.depenses },
    { key: 'epargne', label: t('wallet.epargne'), color: SERIES_COLORS.epargne },
    { key: 'solde', label: t('wallet.solde'), color: SERIES_COLORS.solde },
  ] as const, [t]);

  const { seriesPaths, gridY, gridX, axisX, axisY, xEnd, yEnd, tickLabels, yTickLabels } = useMemo(() => {
    if (data.length === 0) {
      return { seriesPaths: [], gridY: [], gridX: [], axisX: 0, axisY: 0, xEnd: 0, yEnd: 0, tickLabels: [], yTickLabels: [] };
    }

    const allValues = data.flatMap((d) => SERIES.map((s) => d[s.key]));
    const min = Math.min(0, ...allValues);
    const max = Math.max(...allValues);
    const span = max - min || 1;

    const innerW = VIEW_W - PAD_LEFT - PAD_RIGHT;
    const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const xFor = (i: number) => PAD_LEFT + step * i;
    const yFor = (val: number) => PAD_TOP + innerH - ((val - min) / span) * innerH;

    const seriesPaths = SERIES.map((s) => {
      const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d[s.key]) }));
      return { key: s.key, color: s.color, path: buildLinePath(pts) };
    });

    const gridY = [0.25, 0.5, 0.75, 1].map((t) => PAD_TOP + innerH * t);
    const gridX = data.map((_, i) => xFor(i));

    const tickLabels = data.map((d, i) => ({ x: xFor(i), label: d.label }));
    const yTickLabels = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD_TOP + innerH * t,
      label: Math.round(min + span * (1 - t)).toLocaleString('fr-FR'),
    }));

    return {
      seriesPaths,
      gridY,
      gridX,
      axisX: PAD_LEFT,
      axisY: VIEW_H - PAD_BOTTOM,
      xEnd: VIEW_W - PAD_RIGHT + 6,
      yEnd: PAD_TOP - 8,
      tickLabels,
      yTickLabels,
    };
  }, [data, SERIES]);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#18353B] shadow-sm p-5 bg-white dark:bg-[#08191E]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-allness-orange to-allness-dark flex items-center justify-center shrink-0">
            <LineChart className="w-3.5 h-3.5 text-white" />
          </span>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-[#F1F5F5]">{t('wallet.monthlySummary')}</h3>
        </div>
        <span className="text-xs text-gray-400 dark:text-[#94A3B8]">{month}</span>
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-44" preserveAspectRatio="none">
        <defs>
          <marker
            id={`${arrowId}-x`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
          </marker>
          <marker
            id={`${arrowId}-y`}
            viewBox="0 0 10 10"
            refX="5"
            refY="2"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 10 L 5 0 L 10 10 z" fill="#6B7280" />
          </marker>
        </defs>

        {/* Grille de fond horizontale */}
        {gridY.map((y, i) => (
          <line
            key={`h-${i}`}
            x1={axisX}
            x2={xEnd}
            y1={y}
            y2={y}
            stroke="#D1D5DB"
            strokeWidth={1}
            strokeDasharray="3 3"
            className="dark:stroke-[#1E3A3F] dark:stroke-opacity-50"
          />
        ))}

        {/* Labels Y (valeurs) */}
        {yTickLabels.map((t, i) => (
          <text
            key={`yl-${i}`}
            x={axisX - 4}
            y={t.y + 3}
            textAnchor="end"
            fontSize={9}
            fill="#9CA3AF"
          >
            {t.label}
          </text>
        ))}

        {/* Grille de fond verticale, alignée sur chaque point */}
        {gridX.map((x, i) => (
          <line
            key={`v-${i}`}
            x1={x}
            x2={x}
            y1={PAD_TOP}
            y2={axisY}
            stroke="#D1D5DB"
            strokeWidth={1}
            strokeDasharray="3 3"
            className="dark:stroke-[#1E3A3F] dark:stroke-opacity-50"
          />
        ))}

        {/* Axe X avec flèche */}
        <line
          x1={axisX}
          y1={axisY}
          x2={xEnd}
          y2={axisY}
          stroke="#6B7280"
          strokeWidth={1.5}
          markerEnd={`url(#${arrowId}-x)`}
        />

        {/* Axe Y avec flèche */}
        <line
          x1={axisX}
          y1={axisY}
          x2={axisX}
          y2={yEnd}
          stroke="#6B7280"
          strokeWidth={1.5}
          markerEnd={`url(#${arrowId}-y)`}
        />

        {/* Courbes : segments droits, sans points, partant toutes de la même origine */}
        {seriesPaths.map(
          (s) =>
            s.path && (
              <path
                key={s.key}
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ),
        )}
      </svg>

      {/* Labels des mois sous le graphique */}
      {tickLabels.length > 0 && (
        <div className="flex justify-between px-[18px] mt-1 mb-2">
          {tickLabels.map((t, i) => (
            <span key={i} className="text-[10px] text-gray-400">
              {t.label}
            </span>
          ))}
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 mb-1 text-[11px]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs mt-2 mb-1">
        <span className="text-allness-green font-semibold">+{incomePercent}%</span>
        <span className="text-gray-400 font-semibold">-{expensePercent}%</span>
      </div>

      <p className="text-sm font-semibold text-gray-800 dark:text-[#F1F5F5] mt-3 mb-4">
        {new Intl.NumberFormat('fr-FR').format(netAmount)} FCFA
      </p>

      {/* Tableau vertical des données */}
      {data.length > 0 && (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#18353B]">
                <th className="text-left py-1.5 font-medium text-gray-400">{t('wallet.month')}</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="text-right py-1.5 font-medium text-gray-400">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-[#18353B]">
                  <td className="py-1.5 font-medium text-gray-600 dark:text-gray-400">{d.label}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="text-right py-1.5 text-gray-700 dark:text-gray-300">
                      {new Intl.NumberFormat('fr-FR').format(d[s.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
