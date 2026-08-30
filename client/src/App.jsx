import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import StockChips from './components/StockChips';
import PriceLineChart from './components/charts/PriceLineChart';
import ReturnsBarChart from './components/charts/ReturnsBarChart';
import RiskRadarChart from './components/charts/RiskRadarChart';
import CompareTable from './components/CompareTable';
import CategoryBrowser from './components/CategoryBrowser';
import FilterPanel from './components/FilterPanel';
import RecommendationList from './components/RecommendationList';
import GoldSilverPage from './components/GoldSilverPage';
import ReturnCalculator from './components/ReturnCalculator';
import IndiaIndexPage from './components/IndiaIndexPage';
import InsightsPage from './components/InsightsPage';
import SidebarSearch from './components/SidebarSearch';
import QuotePage from './components/QuotePage';
import TrendingPage from './components/TrendingPage';
import AIChatButton from './components/AIChatButton';
import FavoritesBar from './components/FavoritesBar';

const PERIODS = ['1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];

const NAV = [
  { id: 'home',       label: 'Home',            icon: '🏠' },
  { id: 'compare',    label: 'Compare',         icon: '⚖️' },
  { id: 'categories', label: 'Browse',          icon: '📂' },
  { id: 'india',      label: 'Nifty & Sensex',  icon: '🇮🇳' },
  { id: 'metals',     label: 'Gold & Silver',   icon: '🥇' },
  { id: 'recommend',  label: 'Recommendations', icon: '🎯' },
  { id: 'calculator', label: 'Calculator',      icon: '🧮' },
  { id: 'insights',   label: 'Insights',        icon: '💡' },
  { id: 'trending',   label: 'Weekly Picks',    icon: '🔥' },
];

const FEATURES = [
  { icon: '⚖️', title: 'Compare Stocks',       desc: 'Side-by-side charts and metrics for up to 5 assets' },
  { icon: '🇮🇳', title: 'Nifty 50 & Sensex',   desc: 'Full index pages with returns, risk and sector filters' },
  { icon: '🥇', title: 'Gold & Silver',        desc: 'Technical signals, spikes, INR/USD toggle, investment thesis' },
  { icon: '🎯', title: 'Best Picks',           desc: 'AI-scored recommendations filtered by horizon and risk' },
  { icon: '🧮', title: 'Return Calculator',   desc: 'Project SIP or lump-sum growth over any time horizon' },
  { icon: '💡', title: 'Insights',             desc: 'Future-proof analysis and SIP vs lump sum guide' },
  { icon: '📂', title: 'Browse Categories',   desc: 'US stocks, Indian ETFs, mutual funds, precious metals' },
];

export function Spinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" />
      <span className="text-slate-400 text-sm">{text}</span>
    </div>
  );
}

function HomePage({ setTab }) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Easy <span className="text-blue-400">Investing</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Real-time stock analysis, Indian market data, gold & silver signals,
          and smart recommendations — all in one place.
        </p>
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <button
            onClick={() => setTab('compare')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-900/30"
          >
            Start Comparing →
          </button>
          <button
            onClick={() => setTab('recommend')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all border border-slate-600"
          >
            Get Best Picks
          </button>
        </div>
      </div>

      {/* Features grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">What you can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <button
              key={f.title}
              onClick={() => {
                const nav = NAV.find(n => n.label === f.title || n.label.includes(f.title.split(' ')[0]));
                if (nav) setTab(nav.id);
              }}
              className="text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 transition-all group"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick start chips */}
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick compare</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ['GLD vs SLV', ['GLD', 'SLV']],
            ['AAPL vs MSFT', ['AAPL', 'MSFT']],
            ['RELIANCE vs TCS', ['RELIANCE.NS', 'TCS.NS']],
            ['SPY vs QQQ', ['SPY', 'QQQ']],
            ['HDFCBANK vs ICICIBANK', ['HDFCBANK.NS', 'ICICIBANK.NS']],
          ].map(([label]) => (
            <button
              key={label}
              onClick={() => setTab('compare')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-slate-700 text-xs pb-4">
        Data from Yahoo Finance · For informational purposes only · Not financial advice
      </p>
    </div>
  );
}

export default function App() {
  const [tab, setTab]                   = useState('home');
  const tabRef = useRef('home');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selected, setSelected]         = useState([]);
  const [period, setPeriod]             = useState('1Y');
  const [compareData, setCompareData]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [serverOk, setServerOk]         = useState(true);
  const [filters, setFilters]           = useState({ horizon: 'long', risk: 'medium', returnType: 'high', category: 'all' });
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading]     = useState(false);
  const [recError, setRecError]         = useState(null);
  const [quoteSymbol, setQuoteSymbol]   = useState(null);
  const [currency, setCurrency]         = useState('INR');
  const [indiaOnly, setIndiaOnly]       = useState(true);
  const [addedToast, setAddedToast]     = useState(null);
  const [usdToInr, setUsdToInr]         = useState(84);
  const [compareChartRaw, setCompareChartRaw] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stockFavorites') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('stockFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (symbol) => setFavorites(f =>
    f.includes(symbol) ? f.filter(x => x !== symbol) : [...f, symbol]
  );

  useEffect(() => { tabRef.current = tab; }, [tab]);

  useEffect(() => {
    axios.get('/api/health').then(() => setServerOk(true)).catch(() => setServerOk(false));
  }, []);

  useEffect(() => {
    axios.get('/api/stocks/quote/USDINR=X')
      .then(r => { if (r.data?.currentPrice) setUsdToInr(r.data.currentPrice); })
      .catch(() => {});
  }, []);

  const fetchCompare = useCallback(async () => {
    if (!selected.length) { setCompareData([]); setCompareError(null); return; }
    setLoading(true); setCompareError(null);
    try {
      const { data } = await axios.get('/api/stocks/compare', {
        params: { symbols: selected.join(','), period: period.toLowerCase() },
      });
      if (!data.length) setCompareError('No data returned. Yahoo Finance may be temporarily unavailable.');
      setCompareData(data);
    } catch {
      setCompareError('Cannot reach the backend server.');
      setServerOk(false);
    }
    setLoading(false);
  }, [selected, period]);

  useEffect(() => { fetchCompare(); }, [fetchCompare]);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true); setRecError(null);
    try {
      const { data } = await axios.get('/api/recommendations', { params: filters, timeout: 120000 });
      if (!data.length) setRecError('No results matched your filters. Try loosening the risk or category filter.');
      setRecommendations(data);
    } catch {
      setRecError('Failed to load recommendations. Make sure the server is running.');
    }
    setRecLoading(false);
  }, [filters]);

  useEffect(() => { if (tab === 'recommend') fetchRecommendations(); }, [tab, fetchRecommendations]);

  useEffect(() => {
    const newCategory = indiaOnly ? 'Nifty 50' : 'all';
    const updated = { ...filters, category: newCategory };
    setFilters(updated);
    if (tabRef.current === 'recommend') {
      setRecLoading(true);
      setRecError(null);
      axios.get('/api/recommendations', { params: updated, timeout: 120000 })
        .then(({ data }) => {
          if (!data.length) setRecError('No results matched your filters. Try loosening the risk or category filter.');
          setRecommendations(data);
        })
        .catch(() => setRecError('Failed to load recommendations. Make sure the server is running.'))
        .finally(() => setRecLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiaOnly]);

  const addSymbol    = s => { if (!selected.includes(s) && selected.length < 5) setSelected(p => [...p, s]); };
  const removeSymbol = s => setSelected(p => p.filter(x => x !== s));
  const addAndCompare = s => {
    addSymbol(s);
    setAddedToast(s);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const handleQuoteSelect = (symbol) => {
    setQuoteSymbol(symbol);
    setTab('quote');
    setSidebarOpen(false);
  };

  const navigate = (id) => { setTab(id); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-slate-900 flex">

      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`fixed top-0 left-0 h-full w-60 bg-slate-900 border-r border-slate-800 z-40 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

          {/* Brand */}
          <div className="px-5 py-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-white font-extrabold text-base leading-none">Easy Investing</div>
                <div className="text-slate-500 text-xs mt-0.5">by architpandey</div>
              </div>
            </div>
          </div>

          {/* Sidebar search */}
          <div className="px-3 py-3 border-b border-slate-800">
            <SidebarSearch onSelect={handleQuoteSelect} />
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === n.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Market + Currency toggles */}
          <div className="px-3 py-3 border-t border-slate-800 space-y-2">
            {/* India / Global toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-700">
              <button
                onClick={() => setIndiaOnly(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                  indiaOnly ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🇮🇳 India
              </button>
              <button
                onClick={() => setIndiaOnly(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                  !indiaOnly ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🌍 All
              </button>
            </div>
            {/* INR / USD toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-700">
              <button
                onClick={() => setCurrency('INR')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  currency === 'INR' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-800">
            <p className="text-slate-600 text-xs">Data from Yahoo Finance</p>
            <p className="text-slate-700 text-xs">Not financial advice</p>
          </div>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold text-sm">Easy Investing</span>
          <span className="text-slate-400 text-sm">{NAV.find(n => n.id === tab)?.icon}</span>
        </header>

        {!serverOk && (
          <div className="bg-red-900/40 border-b border-red-700 px-6 py-2 text-center">
            <span className="text-red-300 text-sm">⚠️ Backend not running — start the server</span>
          </div>
        )}
        {addedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-semibold pointer-events-none">
            ✓ {addedToast} added to compare
          </div>
        )}

        {/* Currency bar */}
        <div className="hidden lg:flex items-center justify-end px-6 py-2 border-b border-slate-800/60 bg-slate-900/80">
          <span className="text-xs text-slate-500 mr-2">Display currency:</span>
          <button
            onClick={() => setCurrency(c => c === 'USD' ? 'INR' : 'USD')}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg transition-all"
          >
            <span className={`text-xs font-bold ${currency === 'USD' ? 'text-blue-400' : 'text-slate-500'}`}>$ USD</span>
            <span className="text-slate-600 text-xs">⇄</span>
            <span className={`text-xs font-bold ${currency === 'INR' ? 'text-blue-400' : 'text-slate-500'}`}>₹ INR</span>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">

          {tab === 'home'  && <HomePage setTab={setTab} />}
          {tab === 'quote' && quoteSymbol && (
            <QuotePage
              symbol={quoteSymbol}
              onAddToCompare={addAndCompare}
              currency={currency}
              usdToInr={usdToInr}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {tab === 'compare' && (
            <div className="space-y-5">
              <SearchBar onSelect={addSymbol} selected={selected} indiaOnly={indiaOnly} />
              <FavoritesBar favorites={favorites} onAdd={addSymbol} onUnfavorite={toggleFavorite} selected={selected} />
              {selected.length > 0 && <StockChips symbols={selected} onRemove={removeSymbol} data={compareData} currency={currency} usdToInr={usdToInr} favorites={favorites} onToggleFavorite={toggleFavorite} />}
              {selected.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Period:</span>
                  {PERIODS.map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        period === p ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}>{p}</button>
                  ))}
                </div>
              )}
              {loading && <Spinner text="Fetching market data..." />}
              {!loading && compareError && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">⚠️ {compareError}</div>
              )}
              {!loading && compareData.length > 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {compareChartRaw ? 'Real Share Prices (native currency)' : 'Price History (Indexed to 100)'}
                        </h3>
                        <button
                          onClick={() => setCompareChartRaw(r => !r)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 transition-all flex-shrink-0"
                        >
                          {compareChartRaw ? 'Indexed view' : 'Real prices'}
                        </button>
                      </div>
                      <PriceLineChart data={compareData} showRaw={compareChartRaw} />
                    </div>
                    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Returns by Period</h3>
                      <ReturnsBarChart data={compareData} />
                    </div>
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Risk vs. Return Radar</h3>
                    <RiskRadarChart data={compareData} />
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 overflow-hidden">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Detailed Metrics (click column to sort)</h3>
                    <CompareTable data={compareData} onCalculate={() => setTab('calculator')} currency={currency} usdToInr={usdToInr} />
                  </div>
                </div>
              )}
              {!loading && !selected.length && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-slate-300 text-lg font-medium mb-2">Compare any stocks, ETFs, or mutual funds</p>
                  <p className="text-slate-500 text-sm">Search above or browse popular categories below</p>
                  <div className="flex justify-center gap-3 mt-6 flex-wrap">
                    {(indiaOnly
                      ? ['RELIANCE.NS', 'HDFCBANK.NS', 'TCS.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS']
                      : ['AAPL', 'NVDA', 'SPY', 'RELIANCE.NS', 'HDFCBANK.NS', 'GLD']
                    ).map(s => (
                      <button key={s} onClick={() => addSymbol(s)}
                        className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:border-blue-500 hover:text-white transition-all">{s.replace('.NS', '')}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'categories' && <CategoryBrowser onAddToCompare={addAndCompare} indiaOnly={indiaOnly} setIndiaOnly={setIndiaOnly} />}
          {tab === 'india'      && <IndiaIndexPage onAddToCompare={addAndCompare} />}
          {tab === 'metals'     && <GoldSilverPage onAddToCompare={addAndCompare} />}

          {tab === 'recommend' && (
            <div className="space-y-5">
              <FilterPanel filters={filters} onChange={setFilters} onApply={fetchRecommendations} indiaOnly={indiaOnly} />
              {recLoading && <Spinner text="Analysing investments… takes ~20–30 seconds" />}
              {!recLoading && recError && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">⚠️ {recError}</div>
              )}
              {!recLoading && !recError && <RecommendationList items={recommendations} onAdd={addAndCompare} />}
            </div>
          )}

          {tab === 'calculator' && <ReturnCalculator compareData={compareData} currency={currency} />}
          {tab === 'insights'   && <InsightsPage />}
          {tab === 'trending'   && <TrendingPage onAddToCompare={addAndCompare} currency={currency} usdToInr={usdToInr} indiaOnly={indiaOnly} />}
        </main>
      </div>

      <AIChatButton stocks={compareData} />
    </div>
  );
}
