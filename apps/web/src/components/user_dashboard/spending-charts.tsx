import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

interface SpendingChartProps {
  data: { month: string; value: number }[];
  breakdown: { label: string; percent: number; color: string }[];
}

export function SpendingChart({ data, breakdown }: SpendingChartProps) {
  const highlightIndex = data.length - 1;

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Ce mois-ci</h3>
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === highlightIndex ? "#1E8449" : "#E5E7EB"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-gray-500">{b.label}</span>
            </div>
            <span className="font-medium text-gray-700">{b.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
