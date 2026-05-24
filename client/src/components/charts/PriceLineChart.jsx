import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export const CHART_COLORS = ['#3b82f6', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

function normalize(history) {
  if (!history?.length) return [];
  const base = history[0].close;
  return history.map(h => ({ ...h, value: +((h.close / base) * 100).toFixed(3) }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-white">{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function PriceLineChart({ data }) {
  if (!data?.length) return null;

  const normalized = data.map(d => ({
    symbol: d.symbol,
    points: normalize(d.history),
  }));

  const dateMap = {};
  for (const { symbol, points } of normalized) {
    for (const { date, value } of points) {
      if (!dateMap[date]) dateMap[date] = { date };
      dateMap[date][symbol] = value;
    }
  }
  const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={d => d.slice(0, 7)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}`}
          domain={['auto', 'auto']}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 11, color: '#94a3b8' }}
          formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>}
        />
        {data.map(({ symbol }, i) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
