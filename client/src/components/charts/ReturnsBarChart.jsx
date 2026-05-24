import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { CHART_COLORS } from './PriceLineChart';

const PERIODS = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-2">{label} return</p>
      {payload.map((p, i) => {
        const pos = p.value >= 0;
        return (
          <div key={i} className="flex items-center justify-between gap-4">
            <span style={{ color: p.fill }}>{p.name}</span>
            <span className={`font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
              {p.value != null ? `${p.value > 0 ? '+' : ''}${p.value.toFixed(2)}%` : 'N/A'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ReturnsBarChart({ data }) {
  if (!data?.length) return null;

  const chartData = PERIODS.map(({ key, label }) => {
    const row = { period: label };
    for (const d of data) {
      row[d.symbol] = d.returns?.[key] ?? null;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}%`}
          width={44}
        />
        <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 11 }}
          formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>}
        />
        {data.map(({ symbol }, i) => (
          <Bar key={symbol} dataKey={symbol} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={32} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
