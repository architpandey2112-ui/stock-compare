const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const RANGES    = { '1w':'5d','1m':'1mo','3m':'3mo','6m':'6mo','1y':'1y','3y':'3y','5y':'5y' };
const INTERVALS = { '1w':'1d','1m':'1d', '3m':'1d', '6m':'1wk','1y':'1wk','3y':'1mo','5y':'1mo' };

let _crumb = null;
let _cookie = null;

async function ensureCrumb() {
  if (_crumb) return;
  try {
    const r1 = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000),
    });
    _cookie = (r1.headers.get('set-cookie') || '').split(';')[0];

    const r2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': _cookie },
      signal: AbortSignal.timeout(8000),
    });
    const crumb = await r2.text();
    if (crumb && crumb.length < 20 && !crumb.includes('<')) _crumb = crumb;
  } catch {
    // Proceed without crumb — most endpoints still work
  }
}

async function yhGet(path) {
  await ensureCrumb();
  const sep = path.includes('?') ? '&' : '?';
  const crumbQ = _crumb ? `${sep}crumb=${encodeURIComponent(_crumb)}` : '';
  const url = `https://query1.finance.yahoo.com${path}${crumbQ}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      ...(_cookie ? { 'Cookie': _cookie } : {}),
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Yahoo Finance returned HTTP ${res.status}`);
  return res.json();
}

// Single call — returns both quote info and price history
export async function fetchSymbol(symbol, period = '1y', forceInterval = null) {
  const range    = RANGES[period]    || '1y';
  const interval = forceInterval || INTERVALS[period] || '1wk';

  const data = await yhGet(
    `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`
  );

  const r = data.chart?.result?.[0];
  if (!r) throw new Error(data.chart?.error?.description || `No data returned for ${symbol}`);

  const m       = r.meta;
  const ts      = r.timestamp || [];
  const closes  = r.indicators?.quote?.[0]?.close || [];
  const prev    = m.chartPreviousClose || m.previousClose || m.regularMarketPrice;
  const chgPct  = prev ? +((m.regularMarketPrice - prev) / prev * 100).toFixed(2) : 0;

  return {
    quote: {
      symbol:                    m.symbol || symbol,
      shortName:                 m.shortName || m.longName || symbol,
      regularMarketPrice:        m.regularMarketPrice,
      regularMarketChangePercent: chgPct,
      fiftyTwoWeekHigh:          m.fiftyTwoWeekHigh,
      fiftyTwoWeekLow:           m.fiftyTwoWeekLow,
      currency:                  m.currency || 'USD',
      quoteType:                 m.instrumentType,
    },
    history: ts
      .map((t, i) => ({ date: new Date(t * 1000).toISOString().split('T')[0], close: closes[i] }))
      .filter(d => d.close != null && !isNaN(d.close)),
  };
}

export async function searchSymbols(query) {
  try {
    const data = await yhGet(
      `/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
    );
    return (data.quotes || [])
      .filter(q => ['EQUITY', 'ETF', 'MUTUALFUND'].includes(q.quoteType))
      .slice(0, 10)
      .map(q => ({
        symbol:   q.symbol,
        name:     q.shortname || q.longname || q.symbol,
        type:     q.quoteType,
        exchange: q.exchDisp || q.exchange,
      }));
  } catch { return []; }
}
