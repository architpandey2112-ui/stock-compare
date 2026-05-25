import { useState, useEffect } from 'react';
import axios from 'axios';
import PriceLineChart from './charts/PriceLineChart';
import { Spinner } from '../App';

function convertPrice(price, stockCurrency, displayCurrency, rate) {
  if (price == null || !rate) return price;
  if (stockCurrency === 'USD' && displayCurrency === 'INR') return price * rate;
  if (stockCurrency === 'INR' && displayCurrency === 'USD') return price / rate;
  return price;
}

function fmtCap(val, sym) {
  if (val == null) return '—';
  if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9)  return `${sym}${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e7)  return `${sym}${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e6)  return `${sym}${(val / 1e6).toFixed(2)}M`;
  return `${sym}${val.toLocaleString()}`;
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-bold text-lg ${highlight ?? 'text-white'}`}>{value ?? '—'}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function Ret({ label, v }) {
  if (v == null) return (
    <div className="text-center bg-slate-800/60 rounded-xl p-3">
      <div className="text-xs text-slate-500 uppercase mb-1">{label}</div>
      <span className="text-slate-600 text-sm">—</span>
    </div>
  );
  const pos = v >= 0;
  return (
    <div className="text-center bg-slate-800/60 rounded-xl p-3">
      <div className="text-xs text-slate-500 uppercase mb-1">{label}</div>
      <span className={`font-bold text-sm ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos ? '+' : ''}{v.toFixed(2)}%
      </span>
    </div>
  );
}

export default function QuotePage({ symbol, onAddToCompare, currency, usdToInr }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true); setError(null); setData(null);
    axios.get(`/api/stocks/quote/${symbol}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <Spinner text={`Loading ${symbol}...`} />;
  if (error)   return <div className="text-red-400 p-6 text-sm">Failed to load {symbol}: {error}</div>;
  if (!data)   return null;

  const sym       = currency === 'INR' ? '₹' : '$';
  const conv      = (p) => convertPrice(p, data.currency, currency, usdToInr);
  const fmt       = (n) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const price     = conv(data.currentPrice);
  const high52    = conv(data.high52w);
  const low52     = conv(data.low52w);
  const marketCap = conv(data.marketCap);

  const riskColor = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400' };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-extrabold text-white">{data.symbol}</h1>
            {data.type && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-400">{data.type}</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-400">
              {data.currency}
            </span>
          </div>
          <p className="text-slate-400">{data.name}</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-white">
            {sym}{fmt(price)}
          </div>
          {data.changePercent != null && (
            <div className={`text-sm font-semibold mt-0.5 ${data.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.changePercent >= 0 ? '▲' : '▼'} {Math.abs(data.changePercent).toFixed(2)}%
              {data.change != null && (
                <span className="ml-1 text-slate-500 text-xs">({sym}{Math.abs(conv(data.change))?.toFixed(2)})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onAddToCompare(data.symbol)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20"
      >
        + Add to Compare
      </button>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="52W High"    value={high52  != null ? `${sym}${fmt(high52)}`  : null} />
        <StatCard label="52W Low"     value={low52   != null ? `${sym}${fmt(low52)}`   : null} />
        <StatCard label="Market Cap"  value={fmtCap(marketCap, sym)} />
        <StatCard label="P/E Ratio"   value={data.pe != null ? data.pe.toFixed(1) : null} />
        <StatCard
          label="Volatility" sub="annualized — lower is safer"
          value={data.volatility != null ? `${data.volatility.toFixed(1)}%` : null}
          highlight={data.volatility < 12 ? 'text-emerald-400' : data.volatility < 25 ? 'text-amber-400' : 'text-red-400'}
        />
        <StatCard
          label="Sharpe Ratio" sub="> 1 is good"
          value={data.sharpe != null ? data.sharpe.toFixed(2) : null}
          highlight={data.sharpe > 1 ? 'text-emerald-400' : data.sharpe > 0 ? 'text-white' : 'text-red-400'}
        />
        <StatCard
          label="Max Drawdown"
          value={data.maxDrawdown != null ? `-${data.maxDrawdown.toFixed(1)}%` : null}
          highlight="text-red-400"
        />
        <StatCard
          label="5Y CAGR" sub="compound annual growth"
          value={data.cagr5y != null ? `${data.cagr5y > 0 ? '+' : ''}${data.cagr5y}%/yr` : null}
          highlight={data.cagr5y > 0 ? 'text-blue-400' : 'text-red-400'}
        />
      </div>

      {/* Risk badge */}
      {data.riskLevel && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Risk Level:</span>
          <span className={`text-sm font-bold ${riskColor[data.riskLevel] ?? 'text-slate-400'}`}>
            {data.riskLevel}
          </span>
        </div>
      )}

      {/* Returns grid */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Returns by Period</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2">
          {['1w','1m','3m','6m','1y','3y','5y'].map(p => (
            <Ret key={p} label={p} v={data.returns?.[p]} />
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.history?.length > 1 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">1Y Price History (Indexed to 100)</h3>
          <PriceLineChart data={[data]} />
        </div>
      )}
    </div>
  );
}
