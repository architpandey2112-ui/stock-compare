const FILTER_OPTIONS = {
  horizon: [
    { value: 'short', label: 'Short-Term', icon: '⚡', desc: 'Best 3–6 month performers' },
    { value: 'long', label: 'Long-Term', icon: '🌳', desc: 'Best 1–5 year performers' },
  ],
  risk: [
    { value: 'low', label: 'Safe', icon: '🛡️', desc: 'Volatility < 13% (bonds, gold)' },
    { value: 'medium', label: 'Moderate', icon: '⚖️', desc: 'Volatility < 28% (index funds)' },
    { value: 'high', label: 'Aggressive', icon: '🚀', desc: 'Any volatility (stocks, silver)' },
  ],
  returnType: [
    { value: 'high', label: 'Max Returns', icon: '📈', desc: 'Prioritize highest profit' },
    { value: 'low', label: 'Capital Preservation', icon: '🏦', desc: 'Minimize loss risk' },
  ],
  category: [
    { value: 'all',              label: 'All Assets',     icon: '🌐' },
    { value: 'Safe Long-Term',   label: 'Safe Long-Term', icon: '🛡️' },
    { value: 'Top Stock',        label: 'US Stocks',      icon: '💼' },
    { value: 'Large Cap',        label: 'Large Cap',      icon: '🏦' },
    { value: 'Gold',             label: 'Gold',           icon: '🥇' },
    { value: 'Silver',           label: 'Silver',         icon: '🥈' },
    { value: 'Nifty 50',        label: 'Nifty 50 (All)', icon: '🇮🇳' },
    { value: 'Sensex 30',       label: 'Sensex (All)',    icon: '📈' },
    { value: 'India ETF',        label: 'India ETFs',     icon: '🏛️' },
  ],
};

function FilterGroup({ label, options, value, onChange, multi = false }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
              value === opt.value
                ? 'bg-blue-600/20 border-blue-600 text-white shadow-md shadow-blue-900/20'
                : 'bg-slate-700/40 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white'
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.desc && value === opt.value && (
              <span className="text-blue-300 text-xs opacity-80">· {opt.desc}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const INDIA_CATEGORIES = new Set(['Nifty 50', 'Sensex 30', 'India ETF']);

export default function FilterPanel({ filters, onChange, onApply, indiaOnly = false }) {
  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Smart Recommendations</h2>
          <p className="text-slate-400 text-sm">Filter investments by your goals and risk tolerance</p>
        </div>
        <button
          onClick={onApply}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-900/30"
        >
          🎯 Find Best Picks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FilterGroup
          label="Investment Horizon"
          options={FILTER_OPTIONS.horizon}
          value={filters.horizon}
          onChange={v => onChange({ ...filters, horizon: v })}
        />
        <FilterGroup
          label="Risk Tolerance"
          options={FILTER_OPTIONS.risk}
          value={filters.risk}
          onChange={v => onChange({ ...filters, risk: v })}
        />
        <FilterGroup
          label="Return Priority"
          options={FILTER_OPTIONS.returnType}
          value={filters.returnType}
          onChange={v => onChange({ ...filters, returnType: v })}
        />
        <FilterGroup
          label="Asset Category"
          options={FILTER_OPTIONS.category.filter(o =>
            !indiaOnly || o.value === 'all' || INDIA_CATEGORIES.has(o.value)
          )}
          value={filters.category}
          onChange={v => onChange({ ...filters, category: v })}
        />
      </div>
    </div>
  );
}
