import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { CHART_COLORS } from './PriceLineChart';

function norm(value, min, max, invert = false) {
  if (value === null || value === undefined || isNaN(value)) return 40;
  const clamped = Math.min(Math.max(value, min), max);
  const n = ((clamped - min) / (max - min)) * 100;
  return invert ? +(100 - n).toFixed(1) : +n.toFixed(1);
}

const METRICS = [
  { label: 'Safety', get: d => norm(d.volatility, 5, 60, true) },
  { label: '1Y Return', get: d => norm(d.returns?.['1y'], -30, 100) },
  { label: '3Y Return', get: d => norm(d.returns?.['3y'], -30, 200) },
  { label: 'Sharpe', get: d => norm(d.sharpe, -1, 3) },
  { label: 'Low Drawdown', get: d => norm(d.maxDrawdown, 0, 80, true) },
  { label: '5Y CAGR', get: d => norm(d.cagr5y, -10, 40) },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-2xl text-xs">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-semibold">{p.value}/100</span>
        </div>
      ))}
    </div>
  );
};

export default function RiskRadarChart({ data }) {
  if (!data?.length) return null;

  const chartData = METRICS.map(({ label, get }) => {
    const row = { metric: label };
    for (const d of data) row[d.symbol] = get(d);
    return row;
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData} margin={{ top: 10, right: 60, bottom: 10, left: 60 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 11 }}
            formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>}
          />
          {data.map(({ symbol }, i) => (
            <Radar
              key={symbol}
              name={symbol}
              dataKey={symbol}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-center text-slate-600 text-xs mt-1">
        All metrics normalized to 0–100. Safety inverts volatility; Low Drawdown inverts max drawdown.
      </p>
    </div>
  );
}
