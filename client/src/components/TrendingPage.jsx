import { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from '../App';

const INDIA_SECTORS = [
  { id: 'it',     sector: 'Information Technology', icon: '💻', color: '#3b82f6',
    stocks: ['TCS.NS','INFY.NS','WIPRO.NS','HCLTECH.NS','TECHM.NS'] },
  { id: 'bank',   sector: 'Banking & Finance',      icon: '🏦', color: '#10b981',
    stocks: ['HDFCBANK.NS','ICICIBANK.NS','KOTAKBANK.NS','AXISBANK.NS','SBIN.NS'] },
  { id: 'auto',   sector: 'Automobiles',            icon: '🚗', color: '#f59e0b',
    stocks: ['TATAMOTORS.NS','MARUTI.NS','M&M.NS','BAJAJ-AUTO.NS','HEROMOTOCO.NS'] },
  { id: 'pharma', sector: 'Pharma & Healthcare',    icon: '💊', color: '#ec4899',
    stocks: ['SUNPHARMA.NS','DRREDDY.NS','CIPLA.NS','APOLLOHOSP.NS','MAXHEALTH.NS'] },
  { id: 'fmcg',   sector: 'FMCG & Consumer',        icon: '🛒', color: '#a78bfa',
    stocks: ['HINDUNILVR.NS','ITC.NS','NESTLEIND.NS','BRITANNIA.NS','DABUR.NS'] },
  { id: 'metal',  sector: 'Metals & Mining',        icon: '⚙️', color: '#94a3b8',
    stocks: ['TATASTEEL.NS','HINDALCO.NS','JSWSTEEL.NS','COALINDIA.NS','VEDL.NS'] },
  { id: 'energy', sector: 'Energy & Oil',           icon: '⚡', color: '#f97316',
    stocks: ['RELIANCE.NS','NTPC.NS','ONGC.NS','POWERGRID.NS','BPCL.NS'] },
  { id: 'realty', sector: 'Real Estate',            icon: '🏢', color: '#14b8a6',
    stocks: ['DLF.NS','GODREJPROP.NS','OBEROIRLTY.NS','PRESTIGE.NS','BRIGADE.NS'] },
];

const GLOBAL_SECTORS = [
  { id: 'tech',     sector: 'Technology',   icon: '💻', color: '#3b82f6',
    stocks: ['NVDA','AAPL','MSFT','AMD','AVGO'] },
  { id: 'finance',  sector: 'Financials',  icon: '🏦', color: '#10b981',
    stocks: ['JPM','GS','BAC','V','MA'] },
  { id: 'health',   sector: 'Healthcare',  icon: '💊', color: '#ec4899',
    stocks: ['LLY','UNH','JNJ','PFE','ABBV'] },
  { id: 'energy',   sector: 'Energy',      icon: '⚡', color: '#f97316',
    stocks: ['XOM','CVX','COP','SLB','MPC'] },
  { id: 'ai',       sector: 'AI & Semis',  icon: '🤖', color: '#a78bfa',
    stocks: ['NVDA','AMD','QCOM','INTC','AVGO'] },
  { id: 'consumer', sector: 'Consumer',    icon: '🛒', color: '#f59e0b',
    stocks: ['AMZN','TSLA','HD','MCD','NKE'] },
];

async function fetchBatch(symbols) {
  const out = {};
  const batches = [];
  for (let i = 0; i < symbols.length; i += 5) batches.push(symbols.slice(i, i + 5));
  const results = await Promise.all(
    batches.map(b =>
      axios.get('/api/stocks/compare', { params: { symbols: b.join(','), period: '1y' }, timeout: 40000 })
        .then(r => r.data).catch(() => [])
    )
  );
  results.flat().forEach(d => { out[d.symbol] = d; });
  return out;
}

function convertPrice(price, stockCurrency, displayCurrency, rate) {
  if (price == null || !rate) return price;
  if (stockCurrency === 'USD' && displayCurrency === 'INR') return price * rate;
  if (stockCurrency === 'INR' && displayCurrency === 'USD') return price / rate;
  return price;
}

function RetBadge({ v, label }) {
  return (
    <div className="text-center min-w-[34px]">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      {v == null
        ? <div className="text-xs text-slate-600">—</div>
        : <div className={`text-xs font-bold ${v >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {v >= 0 ? '+' : ''}{v.toFixed(1)}%
          </div>}
    </div>
  );
}

function GainersLosers({ stocks, currency, usdToInr }) {
  const [period, setPeriod] = useState('1w');
  const sym = currency === 'INR' ? '₹' : '$';

  const withReturn = stocks.filter(d => d.returns?.[period] != null);
  const sorted     = [...withReturn].sort((a, b) => (b.returns[period] ?? 0) - (a.returns[period] ?? 0));
  const gainers    = sorted.slice(0, 5);
  const losers     = [...sorted].reverse().slice(0, 5);

  const Row = ({ d, isGainer }) => {
    const ret   = d.returns[period];
    const price = convertPrice(d.currentPrice, d.currency, currency, usdToInr);
    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white text-sm leading-tight">
            {d.symbol.replace('.NS','').replace('.BO','')}
          </div>
          <div className="text-xs text-slate-500 truncate">{d.name}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {price != null && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              {sym}{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          )}
          <span className={`text-sm font-bold ${isGainer ? 'text-emerald-400' : 'text-red-400'}`}>
            {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-white">Top Gainers & Losers</h3>
        <div className="flex gap-1 bg-slate-700/60 rounded-lg p-1">
          {['1w','1m','1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">▲ Top 5 Gainers</div>
          {gainers.length ? gainers.map(d => <Row key={d.symbol} d={d} isGainer={true} />) : <p className="text-slate-600 text-xs">No data yet</p>}
        </div>
        <div>
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">▼ Top 5 Losers</div>
          {losers.length ? losers.map(d => <Row key={d.symbol} d={d} isGainer={false} />) : <p className="text-slate-600 text-xs">No data yet</p>}
        </div>
      </div>
    </div>
  );
}

function SectorCard({ sector, stockData, onAddToCompare, currency, usdToInr }) {
  const stocks = sector.stocks.map(s => stockData[s]).filter(Boolean);
  if (!stocks.length) return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 flex items-center justify-center min-h-[120px]">
      <div className="text-center">
        <div className="text-2xl mb-1">{sector.icon}</div>
        <div className="text-slate-500 text-sm">{sector.sector}</div>
        <div className="text-slate-600 text-xs mt-1 animate-pulse">Loading…</div>
      </div>
    </div>
  );

  const avgWeek = stocks.reduce((s, d) => s + (d.returns?.['1w'] ?? 0), 0) / stocks.length;
  const sorted  = [...stocks].sort((a, b) => (b.returns?.['1w'] ?? 0) - (a.returns?.['1w'] ?? 0));
  const sym     = currency === 'INR' ? '₹' : '$';

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden" style={{ borderTopColor: sector.color, borderTopWidth: 3 }}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span>{sector.icon}</span>
          <span className="font-bold text-white text-sm">{sector.sector}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${avgWeek >= 0 ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50' : 'bg-red-900/40 text-red-400 border-red-800/50'}`}>
          {avgWeek >= 0 ? '▲ +' : '▼ '}{avgWeek.toFixed(1)}% 1W avg
        </span>
      </div>

      <div className="divide-y divide-slate-700/30">
        {sorted.map(d => {
          const price = convertPrice(d.currentPrice, d.currency, currency, usdToInr);
          return (
            <div key={d.symbol} className="px-3 py-2.5 flex items-center gap-2 hover:bg-slate-700/20 active:bg-slate-700/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-sm">{d.symbol.replace('.NS','').replace('.BO','')}</span>
                  {price != null && (
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {sym}{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-xs truncate">{d.name}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <RetBadge v={d.returns?.['1w']} label="1W" />
                <RetBadge v={d.returns?.['1m']} label="1M" />
                <button
                  onClick={() => onAddToCompare(d.symbol)}
                  className="w-7 h-7 flex items-center justify-center bg-blue-600/20 hover:bg-blue-600 active:bg-blue-700 border border-blue-600/40 text-blue-400 hover:text-white rounded-lg transition-all touch-manipulation text-base font-bold"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrendingPage({ onAddToCompare, currency = 'INR', usdToInr = 84 }) {
  const [indiaOnly, setIndiaOnly] = useState(true);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading]     = useState(false);
  const [fetched, setFetched]     = useState({ india: false, global: false });

  const sectors = indiaOnly ? INDIA_SECTORS : GLOBAL_SECTORS;
  const key     = indiaOnly ? 'india' : 'global';

  useEffect(() => {
    if (fetched[key]) return;
    setLoading(true);
    const all = [...new Set(sectors.flatMap(s => s.stocks))];
    fetchBatch(all).then(map => {
      setStockData(prev => ({ ...prev, ...map }));
      setFetched(prev => ({ ...prev, [key]: true }));
    }).finally(() => setLoading(false));
  }, [indiaOnly]);

  const allStocks = Object.values(stockData).filter(d => {
    const isIndia = d.symbol.endsWith('.NS') || d.symbol.endsWith('.BO');
    return indiaOnly ? isIndia : !isIndia;
  });

  const topMovers = [...allStocks]
    .filter(d => d.returns?.['1w'] != null)
    .sort((a, b) => Math.abs(b.returns['1w']) - Math.abs(a.returns['1w']))
    .slice(0, 6);

  const sortedSectors = [...sectors].sort((a, b) => {
    const avg = sec => {
      const vals = sec.stocks.map(s => stockData[s]?.returns?.['1w']).filter(v => v != null);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : -999;
    };
    return avg(b) - avg(a);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Weekly Sector Picks</h2>
          <p className="text-slate-400 text-sm">Live returns by sector · sorted by best 1W performance · tap + to compare</p>
        </div>
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          <button onClick={() => setIndiaOnly(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${indiaOnly ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            🇮🇳 India
          </button>
          <button onClick={() => setIndiaOnly(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!indiaOnly ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            🌍 Global
          </button>
        </div>
      </div>

      {loading
        ? <Spinner text={`Loading ${indiaOnly ? 'Indian' : 'global'} sector data…`} />
        : <>
            {/* Gainers & Losers */}
            {allStocks.length > 0 && (
              <GainersLosers stocks={allStocks} currency={currency} usdToInr={usdToInr} />
            )}

            {/* Top movers chips */}
            {topMovers.length > 0 && (
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Biggest Moves This Week</h3>
                <div className="flex gap-2 flex-wrap">
                  {topMovers.map(d => (
                    <button key={d.symbol} onClick={() => onAddToCompare(d.symbol)}
                      className="flex items-center gap-2 bg-slate-700/60 hover:bg-blue-600/20 active:bg-blue-600/30 border border-slate-600 hover:border-blue-500 rounded-xl px-3 py-2 transition-all touch-manipulation">
                      <span className="font-bold text-white text-sm">{d.symbol.replace('.NS','').replace('.BO','')}</span>
                      <span className={`text-xs font-bold ${(d.returns?.['1w'] ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(d.returns?.['1w'] ?? 0) >= 0 ? '+' : ''}{d.returns?.['1w']?.toFixed(1)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sector grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedSectors.map(s => (
                <SectorCard key={s.id} sector={s} stockData={stockData}
                  onAddToCompare={onAddToCompare} currency={currency} usdToInr={usdToInr} />
              ))}
            </div>

            <p className="text-xs text-slate-700 text-center pb-2">
              Data from Yahoo Finance · Prices in {currency} · Not financial advice
            </p>
          </>
      }
    </div>
  );
}
