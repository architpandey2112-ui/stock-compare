import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Spinner } from '../App';

// ─── Static Investment Analysis Content ──────────────────────────────────────

const GOLD_PROS = [
  { title: 'Inflation Hedge', body: 'Gold historically preserves purchasing power during inflationary periods. When fiat currencies lose value, gold tends to rise as investors seek hard assets.' },
  { title: 'Safe-Haven Asset', body: 'During geopolitical crises, banking collapses, and market crashes, capital flows into gold. It has been "financial insurance" for thousands of years.' },
  { title: 'Central Bank Demand', body: 'Central banks globally (China, India, Russia, Turkey) have been net buyers since 2010, adding structural demand that supports prices.' },
  { title: 'USD Weakness Hedge', body: 'Gold is priced in USD. When the dollar weakens, gold becomes cheaper for foreign buyers, driving demand and price appreciation.' },
  { title: 'Portfolio Diversification', body: 'Gold has a low or negative correlation to equities during downturns, making it an effective portfolio risk reducer.' },
];

const GOLD_CONS = [
  { title: 'No Income / Dividends', body: 'Gold generates zero yield. You earn money only through price appreciation. Opportunity cost is real compared to dividend stocks or bonds.' },
  { title: 'Underperforms in Bull Markets', body: "During strong economic growth and rising real interest rates, gold often lags equities significantly. The S&P 500 has crushed gold in long bull runs." },
  { title: 'High Price Per Ounce', body: 'At $3,000+/oz, physical gold requires significant capital. ETFs help, but physical storage adds costs (vault fees, insurance).' },
  { title: 'No Intrinsic Cashflow', body: 'Unlike a business or real estate, gold produces nothing. Its value is entirely based on what someone else will pay — making valuation difficult.' },
  { title: 'Manipulated Markets', body: 'COMEX futures and central bank reserves mean gold prices can be influenced by large institutional players, creating short-term distortions.' },
];

const SILVER_PROS = [
  { title: 'Dual Role: Metal + Industry', body: 'Unlike gold, silver is heavily used in industry — solar panels, EV batteries, electronics, medical devices. This adds demand beyond just investment.' },
  { title: 'Solar Energy Boom', body: 'Each solar panel uses ~20g of silver. With global solar capacity expected to triple by 2030, industrial silver demand will surge structurally.' },
  { title: 'More Affordable Entry', body: "Silver's lower price (~$30–$35/oz vs gold at $3,000+) makes it accessible to retail investors. The gold-to-silver ratio often reverts, benefiting silver." },
  { title: 'Higher Upside Potential', body: "Silver is more volatile than gold, but that cuts both ways — in precious metals bull markets, silver often outperforms gold by 2–3x (higher beta asset)." },
  { title: 'Gold/Silver Ratio Opportunity', body: "The historical average ratio is ~60:1. When it exceeds 80:1, silver is historically cheap relative to gold — a potential entry signal." },
];

const SILVER_CONS = [
  { title: 'Higher Volatility', body: 'Silver is roughly 2–3x more volatile than gold. Larger drawdowns (-30% to -50%) are common during economic downturns and risk-off periods.' },
  { title: 'Industrial Demand is Cyclical', body: 'In recessions, manufacturing slows, reducing industrial silver demand. This creates extra downside pressure compared to gold during downturns.' },
  { title: 'No Dividends', body: 'Like gold, silver pays no income. Holding silver ETFs has an annual expense ratio, creating a negative carry compared to yield-generating assets.' },
  { title: 'Storage & Handling Costs', body: "Physical silver's lower value-to-weight ratio makes it expensive to store. A $50,000 gold position fits in a shoebox; the same in silver weighs ~70 lbs." },
  { title: 'ETF Counterparty Risk', body: 'Silver ETFs hold physical silver in vaults, but you rely on the fund manager. In extreme scenarios, physical ownership has advantages ETFs cannot replicate.' },
];

const GOLD_SPIKE_DRIVERS = [
  {
    period: 'Mar 2020', direction: 'down',
    driver: 'COVID crash pulled gold to ~$1,477/oz (−12%) as markets liquidated all assets for cash — then sharp recovery on Fed\'s $2T stimulus package',
    note: 'Gold did NOT hit $2,000 in March 2020. That milestone came in August 2020.',
    source: 'World Gold Council · FXCM Markets',
  },
  {
    period: 'Aug 2020', direction: 'up',
    driver: 'Gold crossed $2,000 for the first time (Aug 4) and hit ATH of $2,075/oz (Aug 6) — deeply negative real rates, USD weakness, COVID uncertainty',
    source: 'World Gold Council · GoldPrice.org',
  },
  {
    period: 'Feb–Mar 2022', direction: 'up',
    driver: 'Russia invaded Ukraine (Feb 24); gold spiked from ~$1,900 to $2,051/oz by Mar 8 on safe-haven demand; LBMA suspended Russian gold bar accreditation',
    source: 'World Gold Council Q1 2022 · ABN AMRO Research',
  },
  {
    period: 'Oct 2023', direction: 'up',
    driver: 'Hamas attacked Israel (Oct 7); gold rallied 7.3% during October, crossing $2,050/oz — Middle East risk premium and central bank buying (800+ tonnes in 9 months)',
    source: 'ING Think · BullionVault',
  },
  {
    period: 'Mar–Apr 2024', direction: 'up',
    driver: 'Gold broke new ATH above $2,200–$2,400; PBoC bought gold for 17+ consecutive months; rate-cut pricing and dollar weakness supported the rally',
    source: 'World Gold Council · J.P. Morgan Global Research',
  },
  {
    period: 'Sep 2024–Mar 2025', direction: 'up',
    driver: 'Fed began cutting rates (Sep 18, 2024 — first cut since 2020); gold up 26%+ in full-year 2024; hit $3,000/oz milestone in March 2025; central banks buying 1,000+ tonnes/yr',
    source: 'World Gold Council · IG Bank Switzerland',
  },
];

const SILVER_SPIKE_DRIVERS = [
  {
    period: 'Jan–Feb 2021', direction: 'up',
    driver: 'Reddit r/WallStreetBets "Silver Squeeze" — silver briefly hit ~$30/oz (Feb 1); SLV ETF absorbed ~$1B in one session; CME raised margin requirements; price quickly retreated to $26',
    source: 'CNBC · Bloomberg · Fortune',
  },
  {
    period: 'Mar 2022', direction: 'up',
    driver: 'Russia–Ukraine war; LBMA banned newly-cast Russian silver bars; commodity supply shock fears — silver rose from ~$24 to ~$27/oz',
    source: 'Reuters · Silver Institute · OilPrice.com',
  },
  {
    period: 'Sep–Oct 2023', direction: 'down',
    driver: 'Dollar strengthened as Fed pushed back rate-cut expectations; silver fell from ~$25 to ~$21/oz — industrial demand concerns compounded the move',
    note: 'This was the actual weak period, not December 2023. Silver recovered into Dec 2023 after the Fed\'s dovish pivot.',
    source: 'Silver Institute · SunSirs Commodity Data',
  },
  {
    period: 'May 2024', direction: 'up',
    driver: 'Silver hit 11-year high of $32.52/oz (May 20); driven by 4th consecutive year of supply deficit (215M+ oz), solar cell transition to higher-silver N-type panels, and short covering',
    source: 'Silver Institute 2024 · Reuters',
  },
  {
    period: 'Oct 2024', direction: 'up',
    driver: 'Record industrial silver demand of 680M oz in 2024 (solar = 16%, EVs = 2.9%); AI data-centre infrastructure demand; gold/silver correlation as gold surged',
    source: 'BlackRock · CME Group · FX Empire',
  },
  {
    period: 'Nov 2025', direction: 'up',
    driver: 'Silver hit historic peak of ~$57/oz — up 90% year-on-year. Driven by London vault depletion, record India physical demand, AI/EV industrial buying, and strong gold correlation as gold surpassed $4,000',
    source: 'CNBC (Nov 29 2025) · CME Group OpenMarkets 2026',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProCon({ items, isPositive }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className={`rounded-lg p-3 border ${
          isPositive ? 'bg-emerald-900/10 border-emerald-800/40' : 'bg-red-900/10 border-red-800/40'
        }`}>
          <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '✓' : '✗'} {item.title}
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function SpikeTimeline({ spikes }) {
  return (
    <div className="space-y-3">
      {spikes.map((s, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.direction === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-300">{s.period}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.direction === 'up' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                {s.direction === 'up' ? '▲ Up' : '▼ Down'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.driver}</p>
            {s.note && (
              <p className="text-xs text-amber-400/80 mt-1 bg-amber-900/10 border border-amber-800/30 rounded px-2 py-1">
                ⚠️ {s.note}
              </p>
            )}
            {s.source && (
              <p className="text-xs text-slate-600 mt-1">Source: {s.source}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SignalBadge({ label, value, type }) {
  const styles = {
    bullish: 'bg-emerald-900/30 border-emerald-700/60 text-emerald-400',
    bearish: 'bg-red-900/30 border-red-700/60 text-red-400',
    neutral: 'bg-slate-700/50 border-slate-600 text-slate-300',
    overbought: 'bg-amber-900/30 border-amber-700/60 text-amber-400',
  };
  const t = type?.toLowerCase().includes('bullish') ? 'bullish'
    : type?.toLowerCase().includes('bearish') ? 'bearish'
    : type?.toLowerCase().includes('overbought') ? 'overbought'
    : 'neutral';
  return (
    <div className={`rounded-lg p-3 border ${styles[t]}`}>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${styles[t].split(' ')[2]}`}>{value}</div>
    </div>
  );
}

function MetalPriceChart({ data, color, symbol, usdInr, inINR }) {
  if (!data?.length) return null;
  const rate = inINR && usdInr ? usdInr : 1;
  const sym = inINR ? '₹' : '$';
  const chartData = data.map(d => ({ date: d.date.slice(0, 7), price: +(d.close * rate).toFixed(2) }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          width={inINR ? 62 : 48}
          tickFormatter={v => inINR ? `₹${(v/1000).toFixed(0)}k` : `$${v}`}
        />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          formatter={v => [`${sym}${v.toLocaleString(inINR ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 })}`, symbol]}
        />
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MetalCard({ metal, pros, cons, spikes, onAddToCompare, color, usdInr, inINR }) {
  const [tab, setTab] = useState('overview');
  const primary = metal?.[0];
  const rate = inINR && usdInr ? usdInr : 1;
  const sym = inINR ? '₹' : '$';
  const fmt = (v) => v == null ? '—' : `${sym}${(v * rate).toLocaleString(inINR ? 'en-IN' : 'en-US', { maximumFractionDigits: inINR ? 0 : 2 })}`;
  const fmtSMA = (v) => v == null ? '—' : `${sym}${(v * rate).toLocaleString(inINR ? 'en-IN' : 'en-US', { maximumFractionDigits: inINR ? 0 : 2 })}`;

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/60" style={{ borderTopColor: color, borderTopWidth: 3 }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {primary?.name?.includes('Gold') ? '🥇' : '🥈'}
              {primary?.name?.includes('Gold') ? 'Gold' : 'Silver'}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {primary?.name?.includes('Gold')
                ? 'The ultimate safe-haven and inflation hedge'
                : 'Industrial metal + precious metal hybrid'}
            </p>
          </div>
          {primary && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{fmt(primary.currentPrice)}</div>
              <div className={`text-sm font-semibold ${primary.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {primary.changePercent >= 0 ? '▲ +' : '▼ '}{Math.abs(primary.changePercent ?? 0).toFixed(2)}% today
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        {primary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <SignalBadge label="Trend" value={primary.trendSignal} type={primary.trendSignal} />
            <SignalBadge label="RSI Momentum" value={primary.momentumSignal} type={primary.momentumSignal} />
            <div className="rounded-lg p-3 bg-slate-700/40 border border-slate-600/40">
              <div className="text-xs text-slate-400 mb-0.5">52W Range</div>
              <div className="text-sm font-semibold text-slate-200">
                {fmt(primary.low52w)} – {fmt(primary.high52w)}
              </div>
            </div>
            <div className="rounded-lg p-3 bg-slate-700/40 border border-slate-600/40">
              <div className="text-xs text-slate-400 mb-0.5">RSI (14)</div>
              <div className={`text-sm font-semibold ${
                primary.rsi > 70 ? 'text-amber-400' : primary.rsi < 30 ? 'text-emerald-400' : 'text-slate-200'
              }`}>
                {primary.rsi ?? '—'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab selector */}
      <div className="flex border-b border-slate-700/60">
        {[
          { id: 'overview', label: 'Overview & Chart' },
          { id: 'invest', label: '✓ Reasons to Invest' },
          { id: 'caution', label: '✗ Risks & Cautions' },
          { id: 'spikes', label: '⚡ Recent Spikes' },
          { id: 'funds', label: 'Available ETFs' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'text-white border-b-2 border-blue-500 bg-slate-700/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === 'overview' && (
          <div className="space-y-4">
            {primary && (
              <>
                <MetalPriceChart data={primary.history1y} color={color} symbol={primary.symbol} usdInr={usdInr} inINR={inINR} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ['1M Return', primary.returns?.['1m']],
                    ['1Y Return', primary.returns?.['1y']],
                    ['3Y Return', primary.returns?.['3y']],
                    ['5Y CAGR', primary.cagr5y],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      <div className={`text-sm font-bold ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {val != null ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : '—'}
                        {label.includes('CAGR') && val != null ? '/yr' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/20 rounded-lg p-3 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>SMA 50</span><span className="text-slate-200">{fmtSMA(primary.sma50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SMA 200</span><span className="text-slate-200">{fmtSMA(primary.sma200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility (ann.)</span><span className="text-slate-200">{primary.volatility?.toFixed(1) ?? '—'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Drawdown</span><span className="text-red-400">-{primary.maxDrawdown?.toFixed(1) ?? '—'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio</span><span className="text-slate-200">{primary.sharpe?.toFixed(2) ?? '—'}</span>
                  </div>
                </div>
              </>
            )}
            <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-3">
              <p className="text-amber-400/80 text-xs">
                ⚠️ <strong>Disclaimer:</strong> RSI, moving averages, and trend signals are technical indicators for educational purposes only. Past performance does not guarantee future results. This is not financial advice.
              </p>
            </div>
          </div>
        )}

        {tab === 'invest' && <ProCon items={pros} isPositive={true} />}
        {tab === 'caution' && <ProCon items={cons} isPositive={false} />}

        {tab === 'spikes' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-xs">
              Major price movements over recent years and their primary catalysts:
            </p>
            <SpikeTimeline spikes={spikes} />
            <div className="bg-slate-700/20 rounded-lg p-4">
              <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Key Insight</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {pros[0]?.title === 'Inflation Hedge'
                  ? 'Gold spikes are strongly correlated with Fed policy uncertainty, real interest rate declines, and geopolitical crisis events. Monitor TIPS yields and DXY (dollar index) as leading indicators.'
                  : 'Silver spikes often lag gold rallies then accelerate. Watch the gold/silver ratio — when it exceeds 80, silver is historically undervalued. Also monitor solar installation forecasts and EV production data for industrial demand signals.'}
              </p>
            </div>
          </div>
        )}

        {tab === 'funds' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs mb-3">ETFs providing exposure — compare them in the Compare tab:</p>
            {metal?.map(m => (
              <div key={m.symbol} className="flex items-center justify-between bg-slate-900/40 rounded-lg p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.symbol}</span>
                    {m.currentPrice && <span className="text-sm text-slate-200">{fmt(m.currentPrice)}</span>}
                  </div>
                  <div className="text-slate-400 text-xs">{m.name}</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-slate-500">1Y: <span className={m.returns?.['1y'] >= 0 ? 'text-emerald-400' : 'text-red-400'}>{m.returns?.['1y'] != null ? `${m.returns['1y'] > 0 ? '+' : ''}${m.returns['1y'].toFixed(1)}%` : '—'}</span></span>
                    <span className="text-xs text-slate-500">Vol: {m.volatility?.toFixed(1) ?? '—'}%</span>
                    <span className="text-xs text-slate-500">Sharpe: {m.sharpe?.toFixed(2) ?? '—'}</span>
                  </div>
                </div>
                <button
                  onClick={() => onAddToCompare(m.symbol)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/60 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  + Compare
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gold–Silver Ratio Panel ──────────────────────────────────────────────────

function GSRatioPanel({ goldPrice, silverPrice }) {
  if (!goldPrice || !silverPrice) return null;
  const ratio = goldPrice / silverPrice;
  const signal = ratio > 85 ? { text: 'Silver historically cheap vs gold (ratio > 85)', color: 'text-emerald-400', hint: 'Potential value opportunity in silver' }
    : ratio > 75 ? { text: 'Ratio elevated — silver moderately undervalued', color: 'text-amber-400', hint: 'Slightly favors silver over gold' }
    : ratio < 60 ? { text: 'Ratio low — silver historically expensive vs gold', color: 'text-red-400', hint: 'Slightly favors gold over silver' }
    : { text: 'Ratio near historical average (~65–75)', color: 'text-slate-300', hint: 'Neither metal is particularly cheap vs the other' };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5">
      <h3 className="text-sm font-bold text-white mb-3">Gold / Silver Ratio</h3>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-4xl font-bold text-white">{ratio.toFixed(1)}:1</div>
        <div>
          <div className={`text-sm font-semibold ${signal.color}`}>{signal.text}</div>
          <div className="text-xs text-slate-500 mt-0.5">{signal.hint}</div>
          <div className="text-xs text-slate-600 mt-1">Historical average: ~65–70:1 | Extremes: 30:1 (2011) to 125:1 (2020)</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function GoldSilverPage({ onAddToCompare }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inINR, setInINR] = useState(false);
  const [usdInr, setUsdInr] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/metals/analysis')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCurrency = async () => {
    if (!inINR && !usdInr) {
      setRateLoading(true);
      try {
        const { data: d } = await axios.get('/api/stocks/compare', {
          params: { symbols: 'USDINR=X', period: '1y' },
          timeout: 15000,
        });
        const rate = d?.[0]?.currentPrice;
        if (rate) setUsdInr(rate);
      } catch {}
      setRateLoading(false);
    }
    setInINR(v => !v);
  };

  if (loading) return <Spinner text="Loading precious metals analysis..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Gold & Silver Analysis</h2>
          <p className="text-slate-400 text-sm">
            Real-time data, technical signals, investment thesis, and risk factors for precious metals ETFs.
          </p>
        </div>

        {/* Currency toggle */}
        <button
          onClick={toggleCurrency}
          disabled={rateLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
            inINR
              ? 'bg-orange-900/30 border-orange-600 text-orange-300'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
          }`}
        >
          {rateLoading ? (
            <span className="animate-spin w-3.5 h-3.5 border border-current border-t-transparent rounded-full" />
          ) : (
            <span>{inINR ? '₹' : '$'}</span>
          )}
          <span>{inINR ? 'Showing INR' : 'Show in INR'}</span>
          {inINR && usdInr && (
            <span className="text-xs text-orange-400/70 font-normal">1$ = ₹{usdInr.toFixed(2)}</span>
          )}
        </button>
      </div>

      <GSRatioPanel
        goldPrice={data?.gold?.[0]?.currentPrice}
        silverPrice={data?.silver?.[0]?.currentPrice}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MetalCard
          metal={data?.gold}
          pros={GOLD_PROS}
          cons={GOLD_CONS}
          spikes={GOLD_SPIKE_DRIVERS}
          onAddToCompare={onAddToCompare}
          color="#f59e0b"
          usdInr={usdInr}
          inINR={inINR}
        />
        <MetalCard
          metal={data?.silver}
          pros={SILVER_PROS}
          cons={SILVER_CONS}
          spikes={SILVER_SPIKE_DRIVERS}
          onAddToCompare={onAddToCompare}
          color="#94a3b8"
          usdInr={usdInr}
          inINR={inINR}
        />
      </div>
    </div>
  );
}
