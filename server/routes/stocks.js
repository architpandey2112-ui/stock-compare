import { Router } from 'express';
import { searchSymbols, fetchSymbol } from '../services/yahooFinance.js';
import {
  calcAllReturns, calcVolatility, calcMaxDrawdown, calcSharpe, calcCAGR, riskLevel
} from '../services/calculator.js';
import { CATEGORIES } from '../data/categories.js';

const router = Router();

const PERIOD_DAYS = { '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365, '3y': 1095, '5y': 1825 };

async function buildSymbolData(symbol, period = '1y') {
  const { quote, history: history5y } = await fetchSymbol(symbol, '5y');

  const days = PERIOD_DAYS[period] || 365;
  const cutoff = Date.now() - days * 86400000;
  const chartHistory = history5y.filter(h => new Date(h.date).getTime() >= cutoff);

  const vol = calcVolatility(history5y);
  const returns = calcAllReturns(history5y);
  const cagr5y = calcCAGR(history5y, 5);

  return {
    symbol: quote?.symbol || symbol,
    name: quote?.shortName || quote?.longName || symbol,
    currentPrice: quote?.regularMarketPrice,
    changePercent: quote?.regularMarketChangePercent,
    change: quote?.regularMarketChange,
    high52w: quote?.fiftyTwoWeekHigh,
    low52w: quote?.fiftyTwoWeekLow,
    marketCap: quote?.marketCap,
    pe: quote?.trailingPE,
    type: quote?.quoteType,
    currency: quote?.currency || 'USD',
    returns,
    cagr5y,
    volatility: vol,
    maxDrawdown: calcMaxDrawdown(history5y),
    sharpe: calcSharpe(history5y),
    riskLevel: riskLevel(vol),
    history: chartHistory,
  };
}

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const results = await searchSymbols(q);
  res.json(results);
});

router.get('/category/:cat', async (req, res) => {
  const items = CATEGORIES[req.params.cat];
  if (!items) return res.status(404).json({ error: 'Unknown category' });

  const results = await Promise.all(
    items.map(async ({ symbol, name, category, note }) => {
      try {
        const data = await buildSymbolData(symbol, '1y');
        return { ...data, category, note };
      } catch {
        return { symbol, name, category, note, error: true };
      }
    })
  );
  res.json(results.filter(r => !r.error));
});

router.get('/compare', async (req, res) => {
  const symbols = (req.query.symbols || '').split(',').filter(Boolean).slice(0, 5);
  const period = (req.query.period || '1y').toLowerCase();

  if (!symbols.length) return res.status(400).json({ error: 'No symbols provided' });

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await buildSymbolData(symbol, period);
      } catch (e) {
        console.error(`[Compare] ${symbol} failed:`, e.message);
        return { symbol, error: e.message };
      }
    })
  );

  res.json(results.filter(r => !r.error));
});

router.get('/quote/:symbol', async (req, res) => {
  try {
    const data = await buildSymbolData(req.params.symbol, '1y');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
