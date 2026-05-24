const CAT_ICONS = {
  'Top Stock': '💼', 'Large Cap': '🏦', 'Mid Cap': '📊',
  'Small Cap': '🚀', Gold: '🥇', Silver: '🥈', Bond: '🏛️',
};

const MEDAL = ['🥇', '🥈', '🥉'];

function ReturnPill({ label, value }) {
  if (value == null) return null;
  const pos = value >= 0;
  return (
    <div className="text-center px-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-sm font-bold mt-0.5 ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos ? '+' : ''}{value.toFixed(1)}%
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const s = {
    Low: 'border-emerald-700 text-emerald-400 bg-emerald-900/20',
    Medium: 'border-amber-700 text-amber-400 bg-amber-900/20',
    High: 'border-red-700 text-red-400 bg-red-900/20',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s[level] || 'border-slate-600 text-slate-400'}`}>{level} Risk</span>;
}

export default function RecommendationList({ items, onAdd }) {
  if (!items?.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🎯</div>
        <p className="text-slate-400">Set your filters above and click "Find Best Picks" to get recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm font-medium">{items.length} investments ranked for your criteria</p>
        <p className="text-slate-600 text-xs">Click "+ Compare" to add any to the comparison view</p>
      </div>

      {items.map((item, i) => (
        <div
          key={item.symbol}
          className={`bg-slate-800/80 border rounded-xl p-4 flex items-center gap-4 hover:border-slate-500 transition-all ${
            i === 0 ? 'border-amber-700/60 shadow-lg shadow-amber-900/10' :
            i === 1 ? 'border-slate-500/60' :
            i === 2 ? 'border-amber-800/40' :
            'border-slate-700'
          }`}
        >
          {/* Rank */}
          <div className="text-2xl w-8 text-center flex-shrink-0">
            {i < 3 ? MEDAL[i] : <span className="text-slate-500 text-sm font-bold">#{i + 1}</span>}
          </div>

          {/* Symbol + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-lg">{item.symbol}</span>
              <span className="text-slate-400 text-sm truncate max-w-[200px]">{item.name}</span>
              <span className="flex items-center gap-1 text-xs bg-slate-700/60 px-2 py-0.5 rounded-full text-slate-400">
                {CAT_ICONS[item.category] || '📊'} {item.category}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <RiskBadge level={item.riskLevel} />
              {item.volatility != null && (
                <span className="text-xs text-slate-500">Vol: {item.volatility.toFixed(1)}%</span>
              )}
              {item.sharpe != null && (
                <span className={`text-xs ${item.sharpe > 1 ? 'text-emerald-500' : 'text-slate-500'}`}>
                  Sharpe: {item.sharpe.toFixed(2)}
                </span>
              )}
              {item.cagr5y != null && (
                <span className="text-xs text-blue-400">5Y CAGR: {item.cagr5y > 0 ? '+' : ''}{item.cagr5y}%/yr</span>
              )}
            </div>

            {item.note && (
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{item.note}</p>
            )}
          </div>

          {/* Returns */}
          <div className="flex items-center gap-1 flex-shrink-0 border-x border-slate-700 px-4">
            <ReturnPill label="3M" value={item.returns?.['3m']} />
            <ReturnPill label="1Y" value={item.returns?.['1y']} />
            <ReturnPill label="5Y" value={item.returns?.['5y']} />
          </div>

          {/* CTA */}
          <button
            onClick={() => onAdd(item.symbol)}
            className="flex-shrink-0 px-3 py-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/50 hover:border-blue-500 text-blue-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
          >
            + Compare
          </button>
        </div>
      ))}

      <p className="text-slate-600 text-xs text-center pt-2">
        Rankings based on historical performance. Not financial advice. Past returns do not guarantee future results.
      </p>
    </div>
  );
}
