import { Router } from 'express';
import { fetchSymbol } from '../services/yahooFinance.js';
import {
  calcAllReturns, calcVolatility, calcMaxDrawdown, calcSharpe, calcCAGR,
  calcRSI, calcSMA, riskLevel
} from '../services/calculator.js';

const router = Router();

const GOLD_SYMBOLS = ['GLD', 'IAU', 'SGOL'];
const SILVER_SYMBOLS = ['SLV', 'SIVR'];

async function getMetalAnalysis(symbol) {
  const { quote, history } = await fetchSymbol(symbol, '5y');

  const history1y = history.filter(h =>
    new Date(h.date).getTime() >= Date.now() - 365 * 86400000
  );

  const returns = calcAllReturns(history);
  const vol = calcVolatility(history);
  const rsi = calcRSI(history);
  const sma50 = calcSMA(history, 50);
  const sma200 = calcSMA(history, 200);
  const currentPrice = quote?.regularMarketPrice;

  // Trend signal: price vs moving averages
  let trendSignal = 'Neutral';
  if (currentPrice && sma50 && sma200) {
    if (currentPrice > sma50 && sma50 > sma200) trendSignal = 'Bullish';
    else if (currentPrice < sma50 && sma50 < sma200) trendSignal = 'Bearish';
  }

  // RSI momentum
  let momentumSignal = 'Neutral';
  if (rsi !== null) {
    if (rsi > 70) momentumSignal = 'Overbought';
    else if (rsi < 30) momentumSignal = 'Oversold — potential buy';
    else if (rsi > 55) momentumSignal = 'Bullish momentum';
    else if (rsi < 45) momentumSignal = 'Bearish momentum';
  }

  // Detect recent spikes (monthly returns > 5%)
  const spikes = [];
  for (let i = 1; i < history1y.length; i++) {
    const monthlyReturn = (history1y[i].close - history1y[i - 1].close) / history1y[i - 1].close * 100;
    if (Math.abs(monthlyReturn) >= 4) {
      spikes.push({
        date: history1y[i].date,
        return: +monthlyReturn.toFixed(2),
        price: history1y[i].close,
      });
    }
  }

  return {
    symbol: quote?.symbol || symbol,
    name: quote?.shortName || symbol,
    currentPrice,
    changePercent: quote?.regularMarketChangePercent,
    high52w: quote?.fiftyTwoWeekHigh,
    low52w: quote?.fiftyTwoWeekLow,
    returns,
    cagr5y: calcCAGR(history, 5),
    volatility: vol,
    maxDrawdown: calcMaxDrawdown(history),
    sharpe: calcSharpe(history),
    riskLevel: riskLevel(vol),
    rsi,
    sma50,
    sma200,
    trendSignal,
    momentumSignal,
    recentSpikes: spikes.slice(-6),
    history1y,
    history5y: history,
  };
}

router.get('/analysis', async (req, res) => {
  try {
    const [goldData, silverData] = await Promise.all([
      Promise.all(GOLD_SYMBOLS.map(s => getMetalAnalysis(s).catch(() => null))),
      Promise.all(SILVER_SYMBOLS.map(s => getMetalAnalysis(s).catch(() => null))),
    ]);

    res.json({
      gold: goldData.filter(Boolean),
      silver: silverData.filter(Boolean),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/history/:symbol', async (req, res) => {
  try {
    const { period = '1y' } = req.query;
    const { history } = await fetchSymbol(req.params.symbol, period);
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
