import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const PRESETS = [
  { symbol: 'GLD', name: 'Gold (GLD)', rate: 8.5, risk: 'Medium', color: '#f59e0b' },
  { symbol: 'SLV', name: 'Silver (SLV)', rate: 6.0, risk: 'High', color: '#94a3b8' },
  { symbol: 'SPY', name: 'S&P 500 (SPY)', rate: 10.5, risk: 'Medium', color: '#3b82f6' },
  { symbol: 'QQQ', name: 'Nasdaq-100 (QQQ)', rate: 14.0, risk: 'High', color: '#8b5cf6' },
  { symbol: 'VOO', name: 'Vanguard S&P (VOO)', rate: 10.5, risk: 'Medium', color: '#34d399' },
  { symbol: 'AAPL', name: 'Apple (AAPL)', rate: 18.0, risk: 'Medium', color: '#f87171' },
  { symbol: 'NVDA', name: 'NVIDIA (NVDA)', rate: 35.0, risk: 'High', color: '#a78bfa' },
  { symbol: 'AGG', name: 'Bonds (AGG)', rate: 3.5, risk: 'Low', color: '#6ee7b7' },
  { symbol: 'CUSTOM', name: 'Custom Rate', rate: 7.0, risk: 'Medium', color: '#64748b' },
];

function fmt(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function computeGrowth(initial, monthly, years, annualRate) {
  const monthlyRate = annualRate / 100 / 12;
  const points = [];
  let balance = initial;

  for (let m = 0; m <= years * 12; m++) {
    if (m > 0) balance = balance * (1 + monthlyRate) + monthly;
    if (m % 12 === 0) {
      const totalInvested = initial + monthly * m;
      points.push({
        year: m / 12,
        balance: +balance.toFixed(2),
        invested: +totalInvested.toFixed(2),
        gains: +(balance - totalInvested).toFixed(2),
      });
    }
  }
  return points;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-2">Year {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReturnCalculator({ compareData }) {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState('SPY');
  const [customRate, setCustomRate] = useState(7.0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSymbols, setCompareSymbols] = useState(['SPY', 'GLD']);

  const preset = PRESETS.find(p => p.symbol === selectedPreset) || PRESETS[0];
  const rate = selectedPreset === 'CUSTOM' ? customRate : preset.rate;

  const data = useMemo(() => computeGrowth(initial, monthly, years, rate), [initial, monthly, years, rate]);
  const final = data[data.length - 1] || {};
  const totalInvested = initial + monthly * years * 12;
  const totalGains = (final.balance || 0) - totalInvested;
  const totalReturn = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

  const compareChartData = useMemo(() => {
    if (!compareMode) return null;
    const sets = compareSymbols.map(sym => {
      const p = PRESETS.find(x => x.symbol === sym);
      return { symbol: sym, rate: p?.rate || 7, color: p?.color || '#64748b', data: computeGrowth(initial, monthly, years, p?.rate || 7) };
    });
    const merged = [];
    for (let y = 0; y <= years; y++) {
      const row = { year: y };
      for (const s of sets) row[s.symbol] = s.data[y]?.balance;
      merged.push(row);
    }
    return { merged, sets };
  }, [compareMode, compareSymbols, initial, monthly, years]);

  const toggleCompareSymbol = sym => {
    setCompareSymbols(prev =>
      prev.includes(sym)
        ? prev.filter(s => s !== sym)
        : prev.length < 4 ? [...prev, sym] : prev
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Investment Return Calculator</h2>
        <p className="text-slate-400 text-sm">
          Project how your investment grows over time. Compare multiple assets side-by-side.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="xl:col-span-1 space-y-5">
          {/* Asset selector */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Select Asset</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {PRESETS.map(p => (
                <button
                  key={p.symbol}
                  onClick={() => setSelectedPreset(p.symbol)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedPreset === p.symbol
                      ? 'bg-blue-600/20 border border-blue-600/60 text-white'
                      : 'border border-transparent text-slate-400 hover:bg-slate-700/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">~{p.rate}%/yr</span>
                    <span className={`px-1.5 py-0.5 rounded border text-xs ${
                      p.risk === 'Low' ? 'border-emerald-700 text-emerald-500' :
                      p.risk === 'High' ? 'border-red-700 text-red-500' :
                      'border-amber-700 text-amber-500'
                    }`}>{p.risk}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedPreset === 'CUSTOM' && (
              <div className="mt-3">
                <label className="text-xs text-slate-400">Custom Annual Return (%)</label>
                <input
                  type="number"
                  value={customRate}
                  onChange={e => setCustomRate(+e.target.value)}
                  min={-20}
                  max={100}
                  step={0.5}
                  className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Investment inputs */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Investment Parameters</h3>

            {[
              { label: 'Initial Investment ($)', value: initial, set: setInitial, min: 0, max: 10000000, step: 1000 },
              { label: 'Monthly Contribution ($)', value: monthly, set: setMonthly, min: 0, max: 100000, step: 100 },
            ].map(({ label, value, set, min, max, step }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <label className="text-slate-400">{label}</label>
                  <span className="text-white font-semibold">{fmt(value)}</span>
                </div>
                <input
                  type="range" min={min} max={max} step={step} value={value}
                  onChange={e => set(+e.target.value)}
                  className="w-full accent-blue-500"
                />
                <input
                  type="number" value={value} min={min} max={max}
                  onChange={e => set(+e.target.value)}
                  className="w-full mt-1.5 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="text-slate-400">Investment Period</label>
                <span className="text-white font-semibold">{years} years</span>
              </div>
              <input
                type="range" min={1} max={40} step={1} value={years}
                onChange={e => setYears(+e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>1yr</span><span>10yr</span><span>20yr</span><span>40yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="xl:col-span-2 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Final Value', value: fmt(final.balance || 0), color: 'text-emerald-400 text-xl' },
              { label: 'Total Invested', value: fmt(totalInvested), color: 'text-blue-400 text-xl' },
              { label: 'Total Gains', value: fmt(Math.max(0, totalGains)), color: totalGains >= 0 ? 'text-emerald-400 text-xl' : 'text-red-400 text-xl' },
              { label: 'Total Return', value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`, color: totalReturn >= 0 ? 'text-emerald-400 text-xl' : 'text-red-400 text-xl' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <div className={`font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Growth chart */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-slate-300">
                {!compareMode ? `${preset.name} · ${rate}% annual return over ${years} years` : 'Multi-Asset Comparison'}
              </h3>
              <button
                onClick={() => setCompareMode(m => !m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  compareMode ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-white'
                }`}
              >
                {compareMode ? '✓ Compare Mode' : 'Compare Assets'}
              </button>
            </div>

            {compareMode && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {PRESETS.filter(p => p.symbol !== 'CUSTOM').map(p => (
                  <button
                    key={p.symbol}
                    onClick={() => toggleCompareSymbol(p.symbol)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      compareSymbols.includes(p.symbol)
                        ? 'text-white border-current'
                        : 'border-slate-600 text-slate-500 hover:border-slate-400'
                    }`}
                    style={compareSymbols.includes(p.symbol) ? { borderColor: p.color, color: p.color } : {}}
                  >
                    {p.symbol}
                  </button>
                ))}
              </div>
            )}

            {!compareMode ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="#3b82f6" fill="url(#investGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="balance" name="Total Value" stroke="#22c55e" fill="url(#gainGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : compareChartData ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={compareChartData.merged} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  {compareChartData.sets.map(s => (
                    <Area key={s.symbol} type="monotone" dataKey={s.symbol} name={s.symbol}
                      stroke={s.color} fill={s.color} fillOpacity={0.05} strokeWidth={2} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          {/* Year-by-year table */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Year-by-Year Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[400px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Year', 'Total Invested', 'Portfolio Value', 'Total Gains', 'Return %'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-slate-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {data.filter((_, i) => i === 0 || (i + 1) % 2 === 0 || i === data.length - 1).map(row => {
                    const gains = row.balance - row.invested;
                    const ret = row.invested > 0 ? (gains / row.invested) * 100 : 0;
                    return (
                      <tr key={row.year} className="hover:bg-slate-700/20">
                        <td className="px-3 py-2 font-semibold text-slate-300">Yr {row.year}</td>
                        <td className="px-3 py-2 text-slate-400">{fmt(row.invested)}</td>
                        <td className="px-3 py-2 font-semibold text-white">{fmt(row.balance)}</td>
                        <td className={`px-3 py-2 font-semibold ${gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(Math.abs(gains))}</td>
                        <td className={`px-3 py-2 font-semibold ${ret >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{ret >= 0 ? '+' : ''}{ret.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 text-xs mt-3">
              * Returns shown are illustrative based on historical average rates. Actual returns will vary. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
