import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function MiniSparkline({ data, color = '#3b82f6', height = 48 }) {
  if (!data?.length) return null;
  const chartData = data.map(d => ({ v: d.close }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, fontSize: 10 }}
          formatter={v => [`$${v.toFixed(2)}`]}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
