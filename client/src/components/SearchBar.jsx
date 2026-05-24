import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { INDIAN_STOCKS } from '../data/indianStocks';

const POPULAR = [
  { symbol: 'GLD',          name: 'Gold ETF',      tag: 'Gold' },
  { symbol: 'SLV',          name: 'Silver ETF',    tag: 'Silver' },
  { symbol: 'AAPL',         name: 'Apple',         tag: 'Stock' },
  { symbol: 'NVDA',         name: 'NVIDIA',        tag: 'Stock' },
  { symbol: 'MSFT',         name: 'Microsoft',     tag: 'Stock' },
  { symbol: 'SPY',          name: 'S&P 500',       tag: 'ETF' },
  { symbol: 'QQQ',          name: 'Nasdaq-100',    tag: 'ETF' },
  { symbol: 'RELIANCE.NS',  name: 'Reliance',      tag: 'India' },
  { symbol: 'HDFCBANK.NS',  name: 'HDFC Bank',     tag: 'India' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank',    tag: 'India' },
  { symbol: 'TCS.NS',       name: 'TCS',           tag: 'India' },
  { symbol: 'INFY.NS',      name: 'Infosys',       tag: 'India' },
  { symbol: 'NIFTYBEES.NS', name: 'Nifty 50 ETF',  tag: 'India ETF' },
  { symbol: 'SBIN.NS',      name: 'SBI',           tag: 'India' },
  { symbol: 'BAJFINANCE.NS',name: 'Bajaj Finance', tag: 'India' },
];

const TAG_COLORS = {
  Gold:       'text-amber-400 bg-amber-900/30 border-amber-700/50',
  Silver:     'text-slate-300 bg-slate-700/50 border-slate-600',
  Stock:      'text-emerald-400 bg-emerald-900/30 border-emerald-700/50',
  ETF:        'text-blue-400 bg-blue-900/30 border-blue-700/50',
  India:      'text-orange-400 bg-orange-900/30 border-orange-700/50',
  'India ETF':'text-teal-400 bg-teal-900/30 border-teal-700/50',
};

function searchLocal(q) {
  const lower = q.toLowerCase();
  return INDIAN_STOCKS.filter(s =>
    s.symbol.toLowerCase().includes(lower) ||
    s.name.toLowerCase().includes(lower) ||
    s.sector.toLowerCase().includes(lower)
  ).slice(0, 6).map(s => ({
    symbol: s.symbol,
    name:   s.name,
    type:   s.sector === 'India ETF' ? 'ETF' : 'EQUITY',
    exchange: 'NSE',
    local: true,
  }));
}

export default function SearchBar({ onSelect, selected }) {
  const [query, setQuery]       = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [open, setOpen]         = useState(false);
  const [searching, setSearching] = useState(false);
  const debounce  = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (!query.trim()) { setApiResults([]); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get('/api/stocks/search', { params: { q: query } });
        setApiResults(data);
      } catch {}
      setSearching(false);
    }, 380);
  }, [query]);

  // Merge: local Indian matches first, then Yahoo Finance results (no duplicates)
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const local = searchLocal(query);
    const localSymbols = new Set(local.map(r => r.symbol));
    const remote = apiResults.filter(r => !localSymbols.has(r.symbol));
    return [...local, ...remote].slice(0, 10);
  }, [query, apiResults]);

  const pick = (symbol) => {
    onSelect(symbol);
    setQuery('');
    setOpen(false);
    setApiResults([]);
  };

  const isSelected = s => selected.includes(s);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search stocks, ETFs, Nifty 50, Sensex (e.g. ICICI, Tata, AAPL)..."
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 pl-11 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">🔍</span>
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {selected.length >= 5 && (
        <p className="text-amber-400 text-xs mt-1.5 ml-1">Maximum 5 symbols selected. Remove one to add more.</p>
      )}

      {/* Quick picks */}
      {!query && selected.length < 5 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {POPULAR.filter(p => !isSelected(p.symbol)).map(p => (
            <button
              key={p.symbol}
              onClick={() => pick(p.symbol)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 ${TAG_COLORS[p.tag] || 'text-slate-400 border-slate-600'}`}
            >
              {p.symbol} <span className="opacity-60">· {p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => !isSelected(r.symbol) && selected.length < 5 && pick(r.symbol)}
              disabled={isSelected(r.symbol) || selected.length >= 5}
              className={`w-full px-4 py-3 flex items-center justify-between text-left border-b border-slate-700/50 last:border-0 transition-colors ${
                isSelected(r.symbol) || selected.length >= 5
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-700/60 cursor-pointer'
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <div>
                  <span className="font-semibold text-white">{r.symbol}</span>
                  <span className="ml-2 text-slate-400 text-sm truncate">{r.name}</span>
                </div>
                {r.local && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-400 border border-orange-700/40 flex-shrink-0">India</span>
                )}
              </div>
              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{r.exchange ?? r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
