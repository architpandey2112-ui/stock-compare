import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { INDIAN_STOCKS } from '../data/indianStocks';

function searchLocal(q) {
  const lower = q.toLowerCase();
  return INDIAN_STOCKS.filter(s =>
    s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
  ).slice(0, 5).map(s => ({ symbol: s.symbol, name: s.name, local: true }));
}

export default function SidebarSearch({ onSelect }) {
  const [query, setQuery]       = useState('');
  const [apiResults, setApi]    = useState([]);
  const [open, setOpen]         = useState(false);
  const [searching, setSearching] = useState(false);
  const debounce   = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (!wrapperRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (!query.trim()) { setApi([]); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get('/api/stocks/search', { params: { q: query } });
        setApi(data);
      } catch {}
      setSearching(false);
    }, 380);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const local = searchLocal(query);
    const localSymbols = new Set(local.map(r => r.symbol));
    return [...local, ...apiResults.filter(r => !localSymbols.has(r.symbol))].slice(0, 8);
  }, [query, apiResults]);

  const pick = symbol => {
    onSelect(symbol);
    setQuery('');
    setOpen(false);
    setApi([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Look up any stock..."
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 pl-8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">🔍</span>
        {searching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 z-50 mt-1 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => pick(r.symbol)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-700/60 border-b border-slate-700/40 last:border-0 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-semibold text-white text-sm">{r.symbol}</div>
                <div className="text-slate-500 text-xs truncate">{r.name}</div>
              </div>
              {r.local && <span className="text-xs text-orange-400 flex-shrink-0">🇮🇳</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
