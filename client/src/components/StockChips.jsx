import { CHART_COLORS } from './charts/PriceLineChart';

function convertPrice(price, stockCurrency, displayCurrency, rate) {
  if (price == null || !rate) return price;
  if (stockCurrency === 'USD' && displayCurrency === 'INR') return price * rate;
  if (stockCurrency === 'INR' && displayCurrency === 'USD') return price / rate;
  return price;
}

export default function StockChips({ symbols, onRemove, data, currency = 'USD', usdToInr }) {
  return (
    <div className="flex flex-wrap gap-2">
      {symbols.map((symbol, i) => {
        const d = data?.find(x => x.symbol === symbol);
        const change = d?.changePercent;
        const pos = change >= 0;

        return (
          <div
            key={symbol}
            className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 group"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="font-bold text-sm text-white">{symbol}</span>
            {d?.currentPrice && (
              <span className="text-slate-300 text-sm">
                {currency === 'INR' ? '₹' : '$'}{convertPrice(d.currentPrice, d.currency, currency, usdToInr)?.toFixed(2)}
              </span>
            )}
            {change != null && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                pos ? 'text-emerald-400 bg-emerald-900/30' : 'text-red-400 bg-red-900/30'
              }`}>
                {pos ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            )}
            <button
              onClick={() => onRemove(symbol)}
              className="text-slate-600 hover:text-red-400 transition-colors text-sm ml-0.5 leading-none"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
