import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Spinner } from '../App';
import { SECTOR_COLORS } from '../data/sectorColors';

const INDEXES = [
  { id: 'nifty50',  label: 'Nifty 50',  icon: '🇮🇳', count: 50, desc: 'NSE flagship index — top 50 large-cap Indian stocks' },
  { id: 'sensex',   label: 'Sensex 30', icon: '📈', count: 30, desc: 'BSE benchmark — 30 largest, most actively traded companies' },
];

function Ret({ v }) {
  if (v == null) return <span className="text-slate-600">—</span>;
  const pos = v >= 0;
  return (
    <span className={`font-semibold text-sm ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{v.toFixed(2)}%
    </span>
  );
}

function RiskBadge({ level }) {
  const s = {
    Low:    'border-emerald-700 text-emerald-400 bg-emerald-900/20',
    Medium: 'border-amber-700  text-amber-400  bg-amber-900/20',
    High:   'border-red-700   text-red-400   bg-red-900/20',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${s[level] || 'border-slate-600 text-slate-400'}`}>{level}</span>;
}

const SORT_KEYS = {
  name:    d => d.name,
  price:   d => d.currentPrice,
  '1d':    d => d.changePercent,
  '1m':    d => d.returns?.['1m'],
  '3m':    d => d.returns?.['3m'],
  '6m':    d => d.returns?.['6m'],
  '1y':    d => d.returns?.['1y'],
  vol:     d => d.volatility,
  sharpe:  d => d.sharpe,
};

export default function IndiaIndexPage({ onAddToCompare }) {
  const [activeIndex, setActiveIndex] = useState('nifty50');
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('1y');
  const [sortDir, setSortDir] = useState('desc');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (cache[activeIndex]) return;
    setLoading(true);
    axios.get(`/api/india/${activeIndex}`)
      .then(r => setCache(prev => ({ ...prev, [activeIndex]: r.data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeIndex]);

  const data = cache[activeIndex] || [];

  const sectors = useMemo(() => {
    const s = new Set(data.map(d => d.sector));
    return ['All', ...Array.from(s).sort()];
  }, [data]);

  const summary = useMemo(() => {
    if (!data.length) return null;
    const valid = data.filter(d => d.returns?.['1y'] != null);
    const avg1y = valid.reduce((s, d) => s + d.returns['1y'], 0) / (valid.length || 1);
    const gainers = data.filter(d => (d.changePercent ?? 0) > 0).length;
    const losers  = data.filter(d => (d.changePercent ?? 0) < 0).length;
    return { avg1y, gainers, losers, total: data.length };
  }, [data]);

  const sorted = useMemo(() => {
    let rows = [...data];
    if (sectorFilter !== 'All') rows = rows.filter(d => d.sector === sectorFilter);
    if (search.trim()) rows = rows.filter(d =>
      d.symbol.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
    );
    const fn = SORT_KEYS[sortKey] || (() => 0);
    rows.sort((a, b) => {
      const va = fn(a) ?? (sortDir === 'desc' ? -9999 : 9999);
      const vb = fn(b) ?? (sortDir === 'desc' ? -9999 : 9999);
      if (typeof va === 'string') return sortDir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return rows;
  }, [data, sectorFilter, search, sortKey, sortDir]);

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const Th = ({ label, k }) => (
    <th
      onClick={() => toggleSort(k)}
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${
        sortKey === k ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Index tabs */}
      <div className="flex gap-3 flex-wrap">
        {INDEXES.map(idx => (
          <button
            key={idx.id}
            onClick={() => { setActiveIndex(idx.id); setSearch(''); setSectorFilter('All'); }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              activeIndex === idx.id
                ? 'bg-orange-900/20 border-orange-600 text-white'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
            }`}
          >
            <span className="text-xl">{idx.icon}</span>
            <div className="text-left">
              <div>{idx.label}</div>
              <div className="text-xs opacity-60">{idx.count} stocks · NSE</div>
            </div>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm">
        {INDEXES.find(i => i.id === activeIndex)?.desc} · Prices in <span className="text-orange-400 font-medium">₹ INR</span>
      </p>

      {loading && <Spinner text={`Loading all ${activeIndex === 'nifty50' ? '50' : '30'} stocks...`} />}

      {!loading && data.length > 0 && (
        <>
          {/* Summary bar */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Stocks Loaded</div>
                <div className="text-lg font-bold text-white">{summary.total}</div>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Avg 1Y Return</div>
                <div className={`text-lg font-bold ${summary.avg1y >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {summary.avg1y > 0 ? '+' : ''}{summary.avg1y.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Today Gainers</div>
                <div className="text-lg font-bold text-emerald-400">▲ {summary.gainers}</div>
              </div>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Today Losers</div>
                <div className="text-lg font-bold text-red-400">▼ {summary.losers}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol or name..."
              className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
            <div className="flex flex-wrap gap-1.5">
              {sectors.map(s => (
                <button
                  key={s}
                  onClick={() => setSectorFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    sectorFilter === s
                      ? 'text-white border-current'
                      : 'border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300'
                  }`}
                  style={sectorFilter === s && s !== 'All'
                    ? { borderColor: SECTOR_COLORS[s] || '#64748b', color: SECTOR_COLORS[s] || '#94a3b8' }
                    : {}
                  }
                >
                  {s} {s !== 'All' && `(${data.filter(d => d.sector === s).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                    <Th label="Company" k="name" />
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sector</th>
                    <Th label="Price ₹" k="price" />
                    <Th label="1D" k="1d" />
                    <Th label="1M" k="1m" />
                    <Th label="3M" k="3m" />
                    <Th label="6M" k="6m" />
                    <Th label="1Y" k="1y" />
                    <Th label="Volatility" k="vol" />
                    <Th label="Sharpe" k="sharpe" />
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {sorted.map((d, i) => (
                    <tr key={d.symbol} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-3 py-2.5 text-slate-600 text-xs">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-white text-sm">{d.symbol.replace('.NS', '')}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[160px]">{d.name}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            borderColor: (SECTOR_COLORS[d.sector] || '#64748b') + '80',
                            color: SECTOR_COLORS[d.sector] || '#94a3b8',
                            backgroundColor: (SECTOR_COLORS[d.sector] || '#64748b') + '15',
                          }}
                        >
                          {d.sector}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-white whitespace-nowrap">
                        ₹{d.currentPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5"><Ret v={d.changePercent} /></td>
                      <td className="px-3 py-2.5"><Ret v={d.returns?.['1m']} /></td>
                      <td className="px-3 py-2.5"><Ret v={d.returns?.['3m']} /></td>
                      <td className="px-3 py-2.5"><Ret v={d.returns?.['6m']} /></td>
                      <td className="px-3 py-2.5"><Ret v={d.returns?.['1y']} /></td>
                      <td className="px-3 py-2.5 text-slate-400 text-sm">{d.volatility?.toFixed(1) ?? '—'}%</td>
                      <td className="px-3 py-2.5">
                        {d.sharpe != null
                          ? <span className={`text-sm font-semibold ${d.sharpe > 1 ? 'text-emerald-400' : d.sharpe > 0 ? 'text-slate-300' : 'text-red-400'}`}>{d.sharpe.toFixed(2)}</span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-3 py-2.5"><RiskBadge level={d.riskLevel} /></td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => onAddToCompare(d.symbol)}
                          className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-500 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                        >
                          + Compare
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-700/60 text-xs text-slate-600 flex justify-between">
              <span>Showing {sorted.length} of {data.length} stocks · Click column headers to sort</span>
              <span>Data from Yahoo Finance NSE · Prices in ₹ INR</span>
            </div>
          </div>
        </>
      )}

      {!loading && data.length === 0 && !loading && (
        <div className="text-center py-16 text-slate-500">
          Failed to load index data. Make sure the server is running.
        </div>
      )}
    </div>
  );
}
