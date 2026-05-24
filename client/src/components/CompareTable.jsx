import { useState } from 'react';

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
  const styles = {
    Low: 'border-emerald-700 bg-emerald-900/30 text-emerald-400',
    Medium: 'border-amber-700 bg-amber-900/30 text-amber-400',
    High: 'border-red-700 bg-red-900/30 text-red-400',
    Unknown: 'border-slate-700 bg-slate-800 text-slate-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[level] || styles.Unknown}`}>
      {level}
    </span>
  );
}

const SORT_KEYS = {
  '1m': d => d.returns?.['1m'],
  '3m': d => d.returns?.['3m'],
  '6m': d => d.returns?.['6m'],
  '1y': d => d.returns?.['1y'],
  '3y': d => d.returns?.['3y'],
  '5y': d => d.returns?.['5y'],
  vol: d => d.volatility,
  sharpe: d => d.sharpe,
  dd: d => d.maxDrawdown,
  cagr: d => d.cagr5y,
};

export default function CompareTable({ data }) {
  const [sortKey, setSortKey] = useState('1y');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...data].sort((a, b) => {
    const fn = SORT_KEYS[sortKey] || (() => 0);
    const va = fn(a) ?? (sortDir === 'desc' ? -9999 : 9999);
    const vb = fn(b) ?? (sortDir === 'desc' ? -9999 : 9999);
    return sortDir === 'desc' ? vb - va : va - vb;
  });

  const Th = ({ label, k, title }) => (
    <th
      title={title}
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${
        sortKey === k ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
      }`}
      onClick={() => toggleSort(k)}
    >
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
            <Th label="1M" k="1m" title="1-Month Return" />
            <Th label="3M" k="3m" title="3-Month Return" />
            <Th label="6M" k="6m" title="6-Month Return" />
            <Th label="1Y" k="1y" title="1-Year Return" />
            <Th label="3Y" k="3y" title="3-Year Return" />
            <Th label="5Y" k="5y" title="5-Year Return" />
            <Th label="5Y CAGR" k="cagr" title="5-Year Compound Annual Growth Rate" />
            <Th label="Volatility" k="vol" title="Annualized Volatility (lower = safer)" />
            <Th label="Max DD" k="dd" title="Maximum Drawdown (largest peak-to-trough drop)" />
            <Th label="Sharpe" k="sharpe" title="Sharpe Ratio (risk-adjusted return, higher = better)" />
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {sorted.map(d => (
            <tr key={d.symbol} className="hover:bg-slate-700/20 transition-colors">
              <td className="px-3 py-3">
                <div className="font-bold text-white">{d.symbol}</div>
                <div className="text-slate-500 text-xs truncate max-w-[140px]">{d.name}</div>
              </td>
              <td className="px-3 py-3 font-semibold text-white whitespace-nowrap">
                {d.currency === 'INR' ? '₹' : '$'}{d.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {d.changePercent != null && (
                  <div className={`text-xs ${d.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {d.changePercent >= 0 ? '▲' : '▼'} {Math.abs(d.changePercent).toFixed(2)}%
                  </div>
                )}
              </td>
              <td className="px-3 py-3"><Ret v={d.returns?.['1m']} /></td>
              <td className="px-3 py-3"><Ret v={d.returns?.['3m']} /></td>
              <td className="px-3 py-3"><Ret v={d.returns?.['6m']} /></td>
              <td className="px-3 py-3"><Ret v={d.returns?.['1y']} /></td>
              <td className="px-3 py-3"><Ret v={d.returns?.['3y']} /></td>
              <td className="px-3 py-3"><Ret v={d.returns?.['5y']} /></td>
              <td className="px-3 py-3">
                {d.cagr5y != null
                  ? <span className={`font-semibold text-sm ${d.cagr5y >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{d.cagr5y > 0 ? '+' : ''}{d.cagr5y}%/yr</span>
                  : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                {d.volatility != null ? `${d.volatility.toFixed(1)}%` : '—'}
              </td>
              <td className="px-3 py-3 text-red-400 whitespace-nowrap">
                {d.maxDrawdown != null ? `-${d.maxDrawdown.toFixed(1)}%` : '—'}
              </td>
              <td className="px-3 py-3">
                {d.sharpe != null
                  ? <span className={`font-semibold text-sm ${d.sharpe > 1 ? 'text-emerald-400' : d.sharpe > 0 ? 'text-slate-300' : 'text-red-400'}`}>{d.sharpe.toFixed(2)}</span>
                  : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-3 py-3"><RiskBadge level={d.riskLevel} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span>Max DD = Maximum Drawdown</span>
        <span>Sharpe &gt; 1 = good risk-adjusted return</span>
        <span>Volatility &lt; 12% = Low Risk</span>
        <span>5Y CAGR = Compound Annual Growth Rate over 5 years</span>
        <span className="text-orange-700">Indian stocks (.NS) are priced in INR ₹</span>
      </div>
    </div>
  );
}
