import { Router } from 'express';
import { fetchSymbol } from '../services/yahooFinance.js';
import {
  calcReturn, calcVolatility, calcMaxDrawdown, calcSharpe, riskLevel
} from '../services/calculator.js';
import { RECOMMENDATION_UNIVERSE, NIFTY_UNIVERSE, SENSEX_UNIVERSE } from '../data/categories.js';

const router = Router();

async function scoreSymbol({ symbol, name, category, note }, horizon) {
  try {
    const { history } = await fetchSymbol(symbol, '1y');
    if (!history || history.length < 10) return null;

    const vol = calcVolatility(history);
    const returns = {
      '1m': calcReturn(history, 30),
      '3m': calcReturn(history, 90),
      '6m': calcReturn(history, 180),
      '1y': calcReturn(history, 365),
    };
    const targetReturn = horizon === 'short'
      ? (returns['3m'] ?? returns['1m'])
      : (returns['1y'] ?? returns['6m']);

    if (targetReturn === null) return null;

    return {
      symbol, name, category, note,
      returns,
      volatility: vol,
      maxDrawdown: calcMaxDrawdown(history),
      sharpe: calcSharpe(history),
      riskLevel: riskLevel(vol),
      targetReturn,
    };
  } catch {
    return null;
  }
}

// Process in batches of 6 to avoid rate limiting
async function batchScore(universe, horizon, batchSize = 6) {
  const results = [];
  for (let i = 0; i < universe.length; i += batchSize) {
    const batch = universe.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(s => scoreSymbol(s, horizon)));
    results.push(...batchResults.filter(Boolean));
  }
  return results;
}

router.get('/', async (req, res) => {
  const { horizon = 'long', risk = 'medium', returnType = 'high', category = 'all' } = req.query;

  const universe =
    category === 'all'          ? RECOMMENDATION_UNIVERSE :
    category === 'Nifty 50'     ? NIFTY_UNIVERSE :
    category === 'Sensex 30'    ? SENSEX_UNIVERSE :
    RECOMMENDATION_UNIVERSE.filter(s =>
      s.category.toLowerCase() === category.toLowerCase()
    );

  console.log(`[Recommendations] horizon=${horizon} risk=${risk} returnType=${returnType} category=${category} universe=${universe.length} symbols`);
  try {
    let scored = await batchScore(universe, horizon);
    console.log(`[Recommendations] scored ${scored.length} symbols successfully`);

    if (risk === 'low')    scored = scored.filter(s => s.volatility !== null && s.volatility < 13);
    if (risk === 'medium') scored = scored.filter(s => s.volatility !== null && s.volatility < 28);

    scored.sort((a, b) =>
      returnType === 'high'
        ? (b.targetReturn ?? -9999) - (a.targetReturn ?? -9999)
        : (a.targetReturn ?? 9999) - (b.targetReturn ?? 9999)
    );

    console.log(`[Recommendations] returning ${Math.min(scored.length, 10)} results`);
    res.json(scored.slice(0, 10));
  } catch (e) {
    console.error('[Recommendations] error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
