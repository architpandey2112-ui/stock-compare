import { NIFTY50, SENSEX30 } from './indiaStocks.js';

// Safe long-term picks — low volatility, consistent performers
const SAFE_LONGTERM = [
  { symbol: 'VTI',  name: 'Vanguard Total Stock Market ETF', category: 'Safe Long-Term', note: 'Entire US market in one fund — 3,700+ stocks, 10%+ avg CAGR since 2001' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF',   category: 'Safe Long-Term', note: 'Top 100 dividend stocks, lower volatility, strong total return with income' },
  { symbol: 'BND',  name: 'Vanguard Total Bond Market ETF',  category: 'Safe Long-Term', note: 'Broad US bond exposure — capital preservation, low risk, steady income' },
  { symbol: 'JNJ',  name: 'Johnson & Johnson',               category: 'Safe Long-Term', note: 'Healthcare giant, 60+ years of consecutive dividend increases, defensive stock' },
  { symbol: 'PG',   name: 'Procter & Gamble',                category: 'Safe Long-Term', note: 'Consumer staples titan, pays dividends since 1890, nearly recession-proof' },
  { symbol: 'KO',   name: 'Coca-Cola',                       category: 'Safe Long-Term', note: 'Warren Buffett\'s favourite — iconic brand, 60+ year dividend streak' },
  { symbol: 'HDFCBANK.NS',   name: 'HDFC Bank',              category: 'Safe Long-Term', note: 'India\'s most consistent large private bank — best asset quality over 25 years' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever',     category: 'Safe Long-Term', note: 'India\'s largest FMCG company, consistent dividends, true defensive play' },
  { symbol: 'ITC.NS',        name: 'ITC Ltd',                category: 'Safe Long-Term', note: 'High dividend yield, diversified business, low debt — classic income stock' },
  { symbol: 'NESTLEIND.NS',  name: 'Nestle India',           category: 'Safe Long-Term', note: 'Premium FMCG, pricing power, parent Nestle SA backs quality and stability' },
];

export const CATEGORIES = {
  'safe-longterm': SAFE_LONGTERM,
  'top-stocks': [
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'Top Stock', note: 'Largest company by market cap, strong ecosystem & services revenue' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Top Stock', note: 'Cloud (Azure) + AI leader, consistent dividend grower' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Top Stock', note: 'Dominates AI/GPU market, explosive revenue growth' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Top Stock', note: 'E-commerce + AWS cloud leader, expanding margins' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Top Stock', note: 'Search monopoly + YouTube + Google Cloud growing fast' },
  ],
  'large-cap': [
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'Large Cap', note: 'Tracks S&P 500, expense ratio 0.03% — most popular index fund' },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', category: 'Large Cap', note: 'Blackrock S&P 500 fund, very low cost and high liquidity' },
    { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', category: 'Large Cap', note: 'Zero expense ratio, tracks S&P 500, Fidelity mutual fund' },
    { symbol: 'QQQ', name: 'Invesco QQQ Nasdaq-100', category: 'Large Cap', note: 'Top 100 non-financial Nasdaq stocks, tech-heavy growth fund' },
    { symbol: 'VV', name: 'Vanguard Large-Cap ETF', category: 'Large Cap', note: 'Broad US large-cap coverage, CRSP US Large Cap Index' },
  ],
  'mid-cap': [
    { symbol: 'VO', name: 'Vanguard Mid-Cap ETF', category: 'Mid Cap', note: 'Tracks CRSP US Mid Cap Index, ~350 mid-size companies' },
    { symbol: 'IJH', name: 'iShares Core S&P Mid-Cap ETF', category: 'Mid Cap', note: 'S&P MidCap 400, strong balance between growth & stability' },
    { symbol: 'SCHM', name: 'Schwab U.S. Mid-Cap ETF', category: 'Mid Cap', note: 'Tracks Dow Jones US Mid-Cap Index, very low 0.04% expense ratio' },
    { symbol: 'MDY', name: 'SPDR S&P MidCap 400 ETF', category: 'Mid Cap', note: 'Oldest mid-cap ETF, high liquidity, S&P MidCap 400 index' },
    { symbol: 'IVOO', name: 'Vanguard S&P Mid-Cap 400 ETF', category: 'Mid Cap', note: 'Pure S&P 400 mid-cap exposure, lower volatility than small cap' },
  ],
  'small-cap': [
    { symbol: 'VB', name: 'Vanguard Small-Cap ETF', category: 'Small Cap', note: 'Tracks CRSP US Small Cap, ~1400 small companies, high diversification' },
    { symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', category: 'Small Cap', note: 'S&P SmallCap 600, higher quality screen than Russell 2000' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Small Cap', note: 'Most widely traded small-cap ETF, 2000 small US companies' },
    { symbol: 'SCHA', name: 'Schwab U.S. Small-Cap ETF', category: 'Small Cap', note: 'Dow Jones US Small-Cap Index, 1750+ holdings, 0.04% expense' },
    { symbol: 'VBR', name: 'Vanguard Small-Cap Value ETF', category: 'Small Cap', note: 'Small-cap value tilt, historically strong long-term returns' },
  ],
  'precious-metals': [
    { symbol: 'GLD', name: 'SPDR Gold Shares', category: 'Gold', note: 'Largest gold ETF, tracks gold price, $1 = 1/10 oz gold' },
    { symbol: 'IAU', name: 'iShares Gold Trust', category: 'Gold', note: 'Lower expense ratio than GLD (0.25% vs 0.40%), same exposure' },
    { symbol: 'SGOL', name: 'abrdn Physical Gold ETF', category: 'Gold', note: 'Physically backed, Swiss vault storage, 0.17% expense ratio' },
    { symbol: 'SLV', name: 'iShares Silver Trust', category: 'Silver', note: 'Largest silver ETF, tracks LBMA Silver Price, 1 share ≈ 0.95 oz' },
    { symbol: 'SIVR', name: 'abrdn Physical Silver ETF', category: 'Silver', note: 'Physical silver backed, Swiss vault, lower expense than SLV' },
  ],
  'nifty50': NIFTY50.map(s => ({ ...s, category: 'Nifty 50', note: `${s.sector} sector · NSE listed` })),
  'sensex': SENSEX30.map(s => ({ ...s, category: 'Sensex 30', note: `${s.sector} sector · BSE listed` })),
  'india-etf': [
    { symbol: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty 50 BeES', category: 'India ETF', note: 'Most liquid Nifty 50 ETF in India, tracks index directly on NSE' },
    { symbol: 'SETFNIF50.NS', name: 'SBI ETF Nifty 50', category: 'India ETF', note: 'SBI Mutual Fund\'s Nifty 50 ETF, large AUM and low tracking error' },
    { symbol: 'JUNIORBEES.NS', name: 'Nippon India ETF Nifty Next 50', category: 'India ETF', note: 'Tracks Nifty Next 50 — companies likely to enter Nifty 50 next' },
    { symbol: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES', category: 'India ETF', note: 'Gold ETF traded on NSE, tracks domestic gold price in INR' },
    { symbol: 'ICICIB22.NS', name: 'ICICI Pru Bharat 22 ETF', category: 'India ETF', note: 'Tracks Bharat 22 index — 22 PSU and private disinvestment stocks' },
  ],
  'india-large-cap-mf': [
    { symbol: 'NIFTYBEES.NS',  name: 'Nippon India Nifty 50 BeES',       category: 'India Large Cap MF', note: 'Largest & most liquid Nifty 50 ETF fund in India' },
    { symbol: 'SETFNIF50.NS',  name: 'SBI ETF Nifty 50',                 category: 'India Large Cap MF', note: 'SBI AMC\'s flagship Nifty 50 index fund, very low tracking error' },
    { symbol: 'HDFCNIFTY.NS',  name: 'HDFC Nifty 50 ETF',               category: 'India Large Cap MF', note: 'HDFC AMC\'s Nifty 50 ETF with strong AUM and tight spreads' },
    { symbol: 'MOM50.NS',      name: 'Motilal Oswal Nifty 50 ETF',       category: 'India Large Cap MF', note: 'Motilal Oswal\'s Nifty 50 ETF, known for low expense ratio' },
    { symbol: 'UTINIFTETF.NS', name: 'UTI Nifty 50 ETF',                 category: 'India Large Cap MF', note: 'UTI AMC\'s flagship large cap ETF tracking Nifty 50 index' },
  ],
  'india-mid-cap-mf': [
    { symbol: 'JUNIORBEES.NS', name: 'Nippon India ETF Nifty Next 50',   category: 'India Mid Cap MF', note: 'Nifty Next 50 — springboard for stocks entering Nifty 50' },
    { symbol: 'MOM100.NS',     name: 'Motilal Oswal Midcap 100 ETF',     category: 'India Mid Cap MF', note: 'Tracks Nifty Midcap 100, broad mid-cap India exposure' },
    { symbol: 'ICICINX50.NS',  name: 'ICICI Pru Nifty Next 50 ETF',     category: 'India Mid Cap MF', note: 'ICICI Prudential\'s Next 50 ETF, solid performance history' },
    { symbol: 'HDFCNEXT50.NS', name: 'HDFC Nifty Next 50 ETF',          category: 'India Mid Cap MF', note: 'HDFC AMC\'s mid-large cap ETF with broad diversification' },
    { symbol: 'MAFSETF.NS',    name: 'Mirae Asset Nifty Next 50 ETF',   category: 'India Mid Cap MF', note: 'Mirae Asset\'s competitive mid-cap index fund offering' },
  ],
  'india-small-cap-mf': [
    { symbol: 'SMALLCAP250.NS', name: 'Nippon India Nifty Smallcap 250 ETF', category: 'India Small Cap MF', note: 'Tracks Nifty Smallcap 250, broadest small-cap ETF in India' },
    { symbol: 'SETFNIFBK.NS',  name: 'SBI ETF Nifty Bank',              category: 'India Small Cap MF', note: 'Sector ETF tracking Nifty Bank — high beta banking exposure' },
    { symbol: 'ITBEES.NS',     name: 'Nippon India ETF IT BeES',         category: 'India Small Cap MF', note: 'Tracks Nifty IT index — pure-play Indian IT sector ETF' },
    { symbol: 'PSUBNKBEES.NS', name: 'Nippon India ETF PSU Bank BeES',  category: 'India Small Cap MF', note: 'PSU banking sector ETF — high risk, high reward profile' },
    { symbol: 'BANKBEES.NS',   name: 'Nippon India ETF Bank BeES',       category: 'India Small Cap MF', note: 'Banking sector ETF with Nifty Bank index exposure' },
  ],
};

export const ALL_SYMBOLS = [...new Set(Object.values(CATEGORIES).flat().map(s => s.symbol))];

// Top picks from Nifty/Sensex used in the curated "all" pool
const NIFTY_TOP = NIFTY50.slice(0, 15).map(s => ({ ...s, category: 'Nifty 50', note: `${s.sector} · NSE` }));
const SENSEX_TOP = SENSEX30.slice(0, 10).map(s => ({ ...s, category: 'Sensex 30', note: `${s.sector} · BSE` }));

// Full lists exported for when the user filters specifically by index
export const NIFTY_UNIVERSE  = NIFTY50.map(s => ({ ...s, category: 'Nifty 50',  note: `${s.sector} · NSE` }));
export const SENSEX_UNIVERSE = SENSEX30.map(s => ({ ...s, category: 'Sensex 30', note: `${s.sector} · BSE` }));

// Curated pool for "all" — fast enough to score in one request
export const RECOMMENDATION_UNIVERSE = [
  ...CATEGORIES['safe-longterm'],
  ...CATEGORIES['top-stocks'],
  ...CATEGORIES['large-cap'],
  ...CATEGORIES['mid-cap'].slice(0, 2),
  ...CATEGORIES['small-cap'].slice(0, 2),
  ...CATEGORIES['precious-metals'],
  ...CATEGORIES['india-etf'],
  ...NIFTY_TOP,
  ...SENSEX_TOP,
];
