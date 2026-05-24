import { useState, useEffect, useCallback } from 'react';
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

const PERIODS = ['1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];

const TABS = [
  { id: 'compare',    label: 'Compare',        icon: '⚖️' },
  { id: 'categories', label: 'Browse',         icon: '📂' },
  { id: 'india',      label: 'Nifty & Sensex', icon: '🇮🇳' },
  { id: 'metals',     label: 'Gold & Silver',  icon: '🥇' },
  { id: 'recommend',  label: 'Recommendations',icon: '🎯' },
  { id: 'calculator', label: 'Calculator',     icon: '🧮' },
  { id: 'insights',   label: 'Insights',       icon: '💡' },
];

function Spinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" />
      <span className="text-slate-400 text-sm">{text}</span>
    </div>
  );
}

export { Spinner };

export default function App() {
  const [tab, setTab] = useState('compare');
  const [selected, setSelected] = useState([]);
  const [period, setPeriod] = useState('1Y');
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [serverOk, setServerOk] = useState(true);
  const [filters, setFilters] = useState({ horizon: 'long', risk: 'medium', returnType: 'high', category: 'all' });
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  useEffect(() => {
    axios.get('/api/health').then(() => setServerOk(true)).catch(() => setServerOk(false));
  }, []);

  const fetchCompare = useCallback(async () => {
    if (!selected.length) { setCompareData([]); setCompareError(null); return; }
    setLoading(true);
    setCompareError(null);
    try {
      const { data } = await axios.get('/api/stocks/compare', {
        params: { symbols: selected.join(','), period: period.toLowerCase() },
      });
      if (!data.length) {
        setCompareError('No data returned. Yahoo Finance may be temporarily unavailable — wait a moment and try again.');
      }
      setCompareData(data);
    } catch (e) {
      setCompareError('Cannot reach the backend server. Make sure "node index.js" is running in the server terminal.');
      setServerOk(false);
    }
    setLoading(false);
  }, [selected, period]);

  useEffect(() => { fetchCompare(); }, [fetchCompare]);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const { data } = await axios.get('/api/recommendations', {
        params: filters,
        timeout: 120000,
      });
      if (!data.length) setRecError('No results matched your filters. Try loosening the risk or category filter.');
      setRecommendations(data);
    } catch (e) {
      setRecError('Failed to load recommendations. Make sure the server is running, then try again.');
      console.error(e);
    }
    setRecLoading(false);
  }, [filters]);

  useEffect(() => {
    if (tab === 'recommend') fetchRecommendations();
  }, [tab, fetchRecommendations]);

  const addSymbol = (symbol) => {
    if (!selected.includes(symbol) && selected.length < 5) {
      setSelected(prev => [...prev, symbol]);
    }
  };
  const removeSymbol = (symbol) => setSelected(prev => prev.filter(s => s !== symbol));

  const addAndCompare = (symbol) => {
    addSymbol(symbol);
    setTab('compare');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">
                  <span className="text-blue-400">Stock</span>Compare
                </h1>
                <p className="text-slate-500 text-xs">Real-time investment analysis</p>
              </div>
            </div>

            <nav className="flex gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile nav */}
          <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {!serverOk && (
        <div className="bg-red-900/40 border-b border-red-700 px-6 py-3 text-center">
          <span className="text-red-300 text-sm font-medium">
            ⚠️ Backend server not running — open a second terminal and run:{' '}
            <code className="bg-red-900 px-2 py-0.5 rounded text-red-200 text-xs">
              cd "c:\Personal Finance\stock-compare\server" ; node index.js
            </code>
          </span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* COMPARE TAB */}
        {tab === 'compare' && (
          <div className="space-y-5">
            <SearchBar onSelect={addSymbol} selected={selected} />

            {selected.length > 0 && (
              <StockChips symbols={selected} onRemove={removeSymbol} data={compareData} />
            )}

            {selected.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Period:</span>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      period === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {loading && <Spinner text="Fetching market data..." />}

            {!loading && compareError && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
                ⚠️ {compareError}
              </div>
            )}

            {!loading && compareData.length > 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Price History (Indexed to 100)
                    </h3>
                    <PriceLineChart data={compareData} />
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Returns by Period
                    </h3>
                    <ReturnsBarChart data={compareData} />
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Risk vs. Return Radar
                  </h3>
                  <RiskRadarChart data={compareData} />
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 overflow-hidden">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Detailed Metrics (click column to sort)
                  </h3>
                  <CompareTable data={compareData} onCalculate={(sym, price, ret) => {
                    setTab('calculator');
                  }} />
                </div>
              </div>
            )}

            {!loading && !selected.length && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-slate-300 text-lg font-medium mb-2">Compare any stocks, ETFs, or mutual funds</p>
                <p className="text-slate-500 text-sm">Search above or browse popular categories below</p>
                <div className="flex justify-center gap-3 mt-6 flex-wrap">
                  {['GLD', 'SLV', 'AAPL', 'NVDA', 'SPY', 'QQQ'].map(s => (
                    <button
                      key={s}
                      onClick={() => addSymbol(s)}
                      className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:border-blue-500 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BROWSE CATEGORIES TAB */}
        {tab === 'categories' && (
          <CategoryBrowser onAddToCompare={addAndCompare} />
        )}

        {/* INDIA INDEXES TAB */}
        {tab === 'india' && (
          <IndiaIndexPage onAddToCompare={addAndCompare} />
        )}

        {/* GOLD & SILVER TAB */}
        {tab === 'metals' && (
          <GoldSilverPage onAddToCompare={addAndCompare} />
        )}

        {/* RECOMMENDATIONS TAB */}
        {tab === 'recommend' && (
          <div className="space-y-5">
            <FilterPanel filters={filters} onChange={setFilters} onApply={fetchRecommendations} />
            {recLoading && <Spinner text="Analyzing investments… fetching data in batches, takes ~20–30 seconds" />}
            {!recLoading && recError && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
                ⚠️ {recError}
              </div>
            )}
            {!recLoading && !recError && (
              <RecommendationList items={recommendations} onAdd={addAndCompare} />
            )}
          </div>
        )}

        {/* CALCULATOR TAB */}
        {tab === 'calculator' && (
          <ReturnCalculator compareData={compareData} />
        )}

        {/* INSIGHTS TAB */}
        {tab === 'insights' && (
          <InsightsPage />
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center">
        <p className="text-slate-600 text-xs">
          Data from Yahoo Finance · For informational purposes only · Not financial advice
        </p>
      </footer>
    </div>
  );
}
