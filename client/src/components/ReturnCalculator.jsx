import { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MARKET_PRESETS = [
  { symbol: 'SPY',    name: 'S&P 500 (SPY)',       rate: 10.5, risk: 'Medium', color: '#3b82f6' },
  { symbol: 'QQQ',    name: 'Nasdaq-100 (QQQ)',     rate: 14.0, risk: 'High',   color: '#8b5cf6' },
  { symbol: 'GLD',    name: 'Gold (GLD)',            rate: 8.5,  risk: 'Medium', color: '#f59e0b' },
  { symbol: 'SLV',    name: 'Silver (SLV)',          rate: 6.0,  risk: 'High',   color: '#94a3b8' },
  { symbol: 'AAPL',   name: 'Apple (AAPL)',          rate: 18.0, risk: 'Medium', color: '#f87171' },
  { symbol: 'NVDA',   name: 'NVIDIA (NVDA)',         rate: 35.0, risk: 'High',   color: '#a78bfa' },
  { symbol: 'AGG',    name: 'US Bonds (AGG)',        rate: 3.5,  risk: 'Low',    color: '#6ee7b7' },
];

const FD_PRESETS = [
  { symbol: 'FD_SBI',  name: 'SBI / Bank FD (3yr)', rate: 7.1,  risk: 'Low', color: '#22d3ee' },
  { symbol: 'PPF',     name: 'PPF',                  rate: 7.1,  risk: 'Low', color: '#10b981' },
  { symbol: 'NPS_EQ',  name: 'NPS – Equity',         rate: 11.5, risk: 'Medium', color: '#f97316' },
  { symbol: 'SCSS',    name: 'Sr. Citizen SS (SCSS)', rate: 8.2,  risk: 'Low', color: '#a855f7' },
  { symbol: 'RBI_BON', name: 'RBI Savings Bond',     rate: 7.5,  risk: 'Low', color: '#ec4899' },
  { symbol: 'POST_RD', name: 'Post Office RD',        rate: 6.7,  risk: 'Low', color: '#14b8a6' },
  { symbol: 'ELSS',    name: 'ELSS Mutual Fund (avg)',rate: 13.0, risk: 'High', color: '#84cc16' },
];

const LIVE_COLORS = ['#06b6d4','#f97316','#84cc16','#e879f9','#fb923c','#4ade80','#38bdf8'];

function fmt(n, sym = '$') {
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7) return `${sym}${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  return `${sym}${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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

const CustomTooltip = ({ active, payload, label, sym }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-2">Year {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-white">{fmt(p.value, sym)}</span>
        </div>
      ))}
    </div>
  );
};

function PresetButton({ p, selected, onClick }) {
  const riskColor = { Low: 'border-emerald-700 text-emerald-500', High: 'border-red-700 text-red-500', Medium: 'border-amber-700 text-amber-500' };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
        selected ? 'bg-blue-600/20 border border-blue-600/60 text-white' : 'border border-transparent text-slate-400 hover:bg-slate-700/40 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
        <span className="truncate">{p.name}</span>
        {p.source === 'live' && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-700/40 flex-shrink-0">Live</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs flex-shrink-0 ml-2">
        <span className="text-emerald-400">~{p.rate}%/yr</span>
        {p.period && <span className="text-slate-600 text-xs">({p.period})</span>}
        <span className={`px-1.5 py-0.5 rounded border text-xs ${riskColor[p.risk] || riskColor.Medium}`}>{p.risk}</span>
      </div>
    </button>
  );
}

export default function ReturnCalculator({ compareData, currency = 'USD' }) {
  const [initial, setInitial]           = useState(10000);
  const [monthly, setMonthly]           = useState(500);
  const [years, setYears]               = useState(10);
  const [selectedPreset, setSelectedPreset] = useState('SPY');
  const [customRate, setCustomRate]     = useState(7.0);
  const [compareMode, setCompareMode]   = useState(false);
  const [compareSymbols, setCompareSymbols] = useState(['SPY', 'GLD']);

  // Live search
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searching, setSearching]       = useState(false);
  const [livePicks, setLivePicks]       = useState([]);
  const [fetchingQuote, setFetchingQuote] = useState(null);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  const sym = currency === 'INR' ? '₹' : '$';

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = e => { if (!searchWrapRef.current?.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get('/api/stocks/search', { params: { q: searchQuery } });
        setSearchResults(data.slice(0, 7));
      } catch {}
      setSearching(false);
    }, 400);
  }, [searchQuery]);

  const pickFromSearch = async (result) => {
    setSearchQuery('');
    setSearchOpen(false);
    setSearchResults([]);
    setFetchingQuote(result.symbol);
    try {
      const { data } = await axios.get(`/api/stocks/quote/${result.symbol}`);
      const rawRate = data.cagr5y ?? data.returns?.['3y'] ?? data.returns?.['1y'];
      const rate    = rawRate != null ? +rawRate.toFixed(1) : 8.0;
      const period  = data.cagr5y != null ? '5Y CAGR' : data.returns?.['3y'] != null ? '3Y ret' : '1Y ret';
      const color   = LIVE_COLORS[livePicks.length % LIVE_COLORS.length];
      const pick    = { symbol: result.symbol, name: data.name || result.name || result.symbol, rate, risk: data.riskLevel || 'Medium', color, source: 'live', period };
      setLivePicks(prev => [...prev.filter(p => p.symbol !== pick.symbol), pick]);
      setSelectedPreset(result.symbol);
    } catch {
      setFetchingQuote(null);
    }
    setFetchingQuote(null);
  };

  const ALL_PRESETS = [...MARKET_PRESETS, ...FD_PRESETS, { symbol: 'CUSTOM', name: 'Custom Rate', rate: customRate, risk: 'Medium', color: '#64748b' }];
  const allOptions  = [...ALL_PRESETS, ...livePicks];
  const activePreset = allOptions.find(p => p.symbol === selectedPreset) || ALL_PRESETS[0];
  const rate         = selectedPreset === 'CUSTOM' ? customRate : activePreset.rate;

  const data = useMemo(() => computeGrowth(initial, monthly, years, rate), [initial, monthly, years, rate]);
  const final = data[data.length - 1] || {};
  const totalInvested = initial + monthly * years * 12;
  const totalGains    = (final.balance || 0) - totalInvested;
  const totalReturn   = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

  const toggleCompareSymbol = sym => {
    setCompareSymbols(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : prev.length < 4 ? [...prev, sym] : prev);
  };

  const compareChartData = useMemo(() => {
    if (!compareMode) return null;
    const sets = compareSymbols.map(s => {
      const p = allOptions.find(x => x.symbol === s);
      return { symbol: s, rate: p?.rate || 7, color: p?.color || '#64748b', data: computeGrowth(initial, monthly, years, p?.rate || 7) };
    });
    const merged = [];
    for (let y = 0; y <= years; y++) {
      const row = { year: y };
      for (const s of sets) row[s.symbol] = s.data[y]?.balance;
      merged.push(row);
    }
    return { merged, sets };
  }, [compareMode, compareSymbols, initial, monthly, years]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Investment Return Calculator</h2>
        <p className="text-slate-400 text-sm">Search any stock, mutual fund, or pick a fixed-income option to project future returns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── Left: controls ── */}
        <div className="xl:col-span-1 space-y-5">

          {/* Live Search */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Search Stock / Mutual Fund</h3>
            <div ref={searchWrapRef} className="relative">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="e.g. Max Healthcare, SBI Bluechip..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                {(searching || fetchingQuote) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {searchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
                  {searchResults.map(r => (
                    <button
                      key={r.symbol}
                      onClick={() => pickFromSearch(r)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-700/60 border-b border-slate-700/40 last:border-0 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm">{r.symbol}</div>
                        <div className="text-slate-500 text-xs truncate">{r.name}</div>
                      </div>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{r.exchange ?? r.type}</span>
                    </button>
                  ))}
                  <p className="text-xs text-slate-600 px-4 py-2">Click to fetch real CAGR from Yahoo Finance</p>
                </div>
              )}
            </div>

            {livePicks.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-500 mb-1.5">Live picks (real CAGR)</p>
                {livePicks.map(p => (
                  <PresetButton key={p.symbol} p={p} selected={selectedPreset === p.symbol} onClick={() => setSelectedPreset(p.symbol)} />
                ))}
              </div>
            )}
          </div>

          {/* Asset selector */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Market Assets</h3>
            <div className="space-y-1 mb-4">
              {MARKET_PRESETS.map(p => (
                <PresetButton key={p.symbol} p={p} selected={selectedPreset === p.symbol} onClick={() => setSelectedPreset(p.symbol)} />
              ))}
            </div>

            <h3 className="text-sm font-semibold text-slate-300 mb-2 pt-3 border-t border-slate-700">Fixed Income / FD / Govt Schemes</h3>
            <div className="space-y-1 mb-4">
              {FD_PRESETS.map(p => (
                <PresetButton key={p.symbol} p={p} selected={selectedPreset === p.symbol} onClick={() => setSelectedPreset(p.symbol)} />
              ))}
            </div>

            <div className="pt-3 border-t border-slate-700">
              <PresetButton
                p={{ symbol: 'CUSTOM', name: 'Custom Rate', rate: customRate, risk: 'Medium', color: '#64748b' }}
                selected={selectedPreset === 'CUSTOM'}
                onClick={() => setSelectedPreset('CUSTOM')}
              />
              {selectedPreset === 'CUSTOM' && (
                <div className="mt-2 ml-4">
                  <label className="text-xs text-slate-400">Annual Return (%)</label>
                  <input
                    type="number" value={customRate}
                    onChange={e => setCustomRate(+e.target.value)}
                    min={-20} max={100} step={0.5}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Investment inputs */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Investment Parameters</h3>
            {[
              { label: `Initial Investment (${sym})`, value: initial, set: setInitial, min: 0, max: 10000000, step: 1000 },
              { label: `Monthly Contribution (${sym})`, value: monthly, set: setMonthly, min: 0, max: 100000, step: 100 },
            ].map(({ label, value, set, min, max, step }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <label className="text-slate-400">{label}</label>
                  <span className="text-white font-semibold">{fmt(value, sym)}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} className="w-full accent-blue-500" />
                <input type="number" value={value} min={min} max={max} onChange={e => set(+e.target.value)}
                  className="w-full mt-1.5 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="text-slate-400">Investment Period</label>
                <span className="text-white font-semibold">{years} years</span>
              </div>
              <input type="range" min={1} max={40} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>1yr</span><span>10yr</span><span>20yr</span><span>40yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: results ── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Final Value',    value: fmt(final.balance || 0, sym),        color: 'text-emerald-400 text-xl' },
              { label: 'Total Invested', value: fmt(totalInvested, sym),             color: 'text-blue-400 text-xl' },
              { label: 'Total Gains',    value: fmt(Math.max(0, totalGains), sym),   color: totalGains >= 0 ? 'text-emerald-400 text-xl' : 'text-red-400 text-xl' },
              { label: 'Total Return',   value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`, color: totalReturn >= 0 ? 'text-emerald-400 text-xl' : 'text-red-400 text-xl' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <div className={`font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Rate info */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm text-slate-400">
              Using <span className="text-white font-semibold">{activePreset.name}</span> at
              <span className="text-emerald-400 font-bold ml-1">{rate}%/yr</span>
              {activePreset.period && <span className="text-slate-500 text-xs ml-1">({activePreset.period})</span>}
            </div>
          </div>

          {/* Growth chart */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-slate-300">
                {!compareMode ? `${activePreset.name} · ${rate}% over ${years} years` : 'Multi-Asset Comparison'}
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
                {allOptions.filter(p => p.symbol !== 'CUSTOM').map(p => (
                  <button
                    key={p.symbol}
                    onClick={() => toggleCompareSymbol(p.symbol)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      compareSymbols.includes(p.symbol) ? 'text-white border-current' : 'border-slate-600 text-slate-500 hover:border-slate-400'
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
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v, sym)} width={70} />
                  <Tooltip content={<CustomTooltip sym={sym} />} />
                  <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="#3b82f6" fill="url(#investGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="balance" name="Total Value" stroke="#22c55e" fill="url(#gainGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : compareChartData ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={compareChartData.merged} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v, sym)} width={70} />
                  <Tooltip content={<CustomTooltip sym={sym} />} />
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
                    const ret   = row.invested > 0 ? (gains / row.invested) * 100 : 0;
                    return (
                      <tr key={row.year} className="hover:bg-slate-700/20">
                        <td className="px-3 py-2 font-semibold text-slate-300">Yr {row.year}</td>
                        <td className="px-3 py-2 text-slate-400">{fmt(row.invested, sym)}</td>
                        <td className="px-3 py-2 font-semibold text-white">{fmt(row.balance, sym)}</td>
                        <td className={`px-3 py-2 font-semibold ${gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(Math.abs(gains), sym)}</td>
                        <td className={`px-3 py-2 font-semibold ${ret >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{ret >= 0 ? '+' : ''}{ret.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 text-xs mt-3">
              * Live rates use real historical CAGR from Yahoo Finance. Fixed income rates are current government-published rates. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
