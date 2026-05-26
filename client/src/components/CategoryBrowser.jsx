import { useState, useEffect } from 'react';
import axios from 'axios';

const CAT_GROUPS = [
  {
    label: 'US Markets',
    cats: [
      { id: 'top-stocks',  label: 'Top 5 Stocks',     icon: '💼', desc: 'Largest US companies by market cap' },
      { id: 'large-cap',   label: 'Large Cap Funds',   icon: '🏦', desc: 'S&P 500 index funds & ETFs' },
      { id: 'mid-cap',     label: 'Mid Cap Funds',     icon: '📊', desc: 'S&P 400 mid-size company ETFs' },
      { id: 'small-cap',   label: 'Small Cap Funds',   icon: '🚀', desc: 'High-growth small company ETFs' },
      { id: 'precious-metals', label: 'Gold & Silver', icon: '🥇', desc: 'Precious metals ETFs' },
    ],
  },
  {
    label: 'India Markets',
    cats: [
      { id: 'nifty50',            label: 'Nifty 50 (All 50)',    icon: '🇮🇳', desc: 'All 50 Nifty stocks by NSE index weight' },
      { id: 'sensex',             label: 'Sensex (All 30)',      icon: '📈', desc: 'All 30 Sensex stocks by BSE index weight' },
      { id: 'india-etf',          label: 'India ETFs',           icon: '🏛️', desc: 'Indian index & gold ETFs traded on NSE' },
    ],
  },
  {
    label: 'India Mutual Funds',
    cats: [
      { id: 'india-large-cap-mf', label: 'Large Cap MFs',        icon: '🏢', desc: 'Top 5 Indian large-cap mutual fund ETFs tracking Nifty 50' },
      { id: 'india-mid-cap-mf',   label: 'Mid Cap MFs',          icon: '📦', desc: 'Top 5 Indian mid-cap mutual fund ETFs (Nifty Next 50)' },
      { id: 'india-small-cap-mf', label: 'Small Cap MFs',        icon: '🌱', desc: 'Top 5 Indian small-cap & sector ETFs on NSE' },
    ],
  },
];

const CATS = CAT_GROUPS.flatMap(g => g.cats);

const CAT_COLORS = {
  'top-stocks':          'border-emerald-700/60 bg-emerald-900/10',
  'large-cap':           'border-blue-700/60 bg-blue-900/10',
  'mid-cap':             'border-violet-700/60 bg-violet-900/10',
  'small-cap':           'border-amber-700/60 bg-amber-900/10',
  'precious-metals':     'border-yellow-700/60 bg-yellow-900/10',
  'nifty50':             'border-orange-700/60 bg-orange-900/10',
  'sensex':              'border-green-700/60 bg-green-900/10',
  'india-etf':           'border-teal-700/60 bg-teal-900/10',
  'india-large-cap-mf':  'border-sky-700/60 bg-sky-900/10',
  'india-mid-cap-mf':    'border-purple-700/60 bg-purple-900/10',
  'india-small-cap-mf':  'border-pink-700/60 bg-pink-900/10',
};

function Ret({ v }) {
  if (v == null) return <span className="text-slate-600 text-xs">—</span>;
  const pos = v >= 0;
  return <span className={`text-xs font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pos ? '+' : ''}{v.toFixed(1)}%</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
      <div className="h-3 bg-slate-700 rounded w-36 mb-3" />
      <div className="flex gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-700 rounded w-14" />)}
      </div>
    </div>
  );
}

export default function CategoryBrowser({ onAddToCompare, indiaOnly, setIndiaOnly }) {
  const [activeCat, setActiveCat] = useState(indiaOnly ? 'nifty50' : 'top-stocks');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveCat(indiaOnly ? 'nifty50' : 'top-stocks');
  }, [indiaOnly]);

  useEffect(() => {
    if (data[activeCat]) return;
    setLoading(true);
    axios.get(`/api/stocks/category/${activeCat}`)
      .then(r => setData(prev => ({ ...prev, [activeCat]: r.data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat]);

  const items = data[activeCat] || [];
  const visibleGroups = indiaOnly ? CAT_GROUPS.filter(g => g.label.startsWith('India')) : CAT_GROUPS;

  return (
    <div className="space-y-5">
      {/* Category tabs grouped */}
      <div className="space-y-3">
        {visibleGroups.map(group => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{group.label}</div>
            <div className="flex gap-2 flex-wrap">
              {group.cats.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    activeCat === c.id
                      ? `${CAT_COLORS[c.id]} text-white`
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {CATS.find(c => c.id === activeCat) && (
        <p className="text-slate-400 text-sm">{CATS.find(c => c.id === activeCat).desc}</p>
      )}

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={item.symbol}
              className="bg-slate-800/80 rounded-xl border border-slate-700 hover:border-slate-500 transition-all p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{item.symbol}</span>
                    {item.changePercent != null && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        item.changePercent >= 0 ? 'text-emerald-400 bg-emerald-900/30' : 'text-red-400 bg-red-900/30'
                      }`}>
                        {item.changePercent >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 leading-tight">{item.name}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    {item.currency === 'INR' ? '₹' : '$'}{item.currentPrice?.toLocaleString(item.currency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-medium mt-0.5 px-1.5 py-0.5 rounded-full border ${
                    item.riskLevel === 'Low' ? 'border-emerald-700 text-emerald-400' :
                    item.riskLevel === 'Medium' ? 'border-amber-700 text-amber-400' :
                    'border-red-700 text-red-400'
                  }`}>
                    {item.riskLevel} Risk
                  </div>
                </div>
              </div>

              {/* Returns grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/40 rounded-lg p-3">
                {[['1M', '1m'], ['1Y', '1y'], ['5Y', '5y']].map(([label, key]) => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-slate-500 mb-1">{label}</div>
                    <Ret v={item.returns?.[key]} />
                  </div>
                ))}
              </div>

              {/* Note */}
              {item.note && (
                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-700/50 pt-2">
                  {item.note}
                </p>
              )}

              {/* Metrics row */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Vol: {item.volatility?.toFixed(1) ?? '—'}%</span>
                <span>Sharpe: {item.sharpe?.toFixed(2) ?? '—'}</span>
                <span>CAGR: {item.cagr5y != null ? `${item.cagr5y > 0 ? '+' : ''}${item.cagr5y}%` : '—'}</span>
              </div>

              {/* Actions */}
              <button
                onClick={() => onAddToCompare(item.symbol)}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/60 hover:border-blue-500 text-blue-400 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                + Add to Compare
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
