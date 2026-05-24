import { Router } from 'express';
import { fetchSymbol } from '../services/yahooFinance.js';
import { calcReturn, calcVolatility, calcSharpe, calcMaxDrawdown, riskLevel } from '../services/calculator.js';
import { NIFTY50, SENSEX30 } from '../data/indiaStocks.js';

const router = Router();

async function fetchStockData({ symbol, name, sector }) {
  try {
    const { quote, history } = await fetchSymbol(symbol, '1y');
    const vol = calcVolatility(history);
    return {
      symbol, name, sector,
      currentPrice: quote?.regularMarketPrice,
      changePercent: quote?.regularMarketChangePercent,
      high52w: quote?.fiftyTwoWeekHigh,
      low52w: quote?.fiftyTwoWeekLow,
      currency: quote?.currency || 'INR',
      returns: {
        '1m': calcReturn(history, 30),
        '3m': calcReturn(history, 90),
        '6m': calcReturn(history, 180),
        '1y': calcReturn(history, 365),
      },
      volatility: vol,
      maxDrawdown: calcMaxDrawdown(history),
      sharpe: calcSharpe(history),
      riskLevel: riskLevel(vol),
    };
  } catch {
    // Always return the stock so it appears in the table, just with no data
    return { symbol, name, sector, currency: 'INR', noData: true };
  }
}

// Fetch in batches to avoid rate limiting
async function batchFetch(stocks, batchSize = 8) {
  const results = [];
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchStockData));
    results.push(...batchResults);
  }
  return results;
}

router.get('/nifty50', async (req, res) => {
  try {
    const data = await batchFetch(NIFTY50);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/sensex', async (req, res) => {
  try {
    const data = await batchFetch(SENSEX30);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
