export function calcReturn(prices, days) {
  if (!prices?.length) return null;
  const cutoff = Date.now() - days * 86400000;
  const slice = prices.filter(p => new Date(p.date).getTime() >= cutoff);
  if (slice.length < 2) return null;
  const start = slice[0].close;
  const end = slice[slice.length - 1].close;
  return +((end - start) / start * 100).toFixed(2);
}

export function calcAllReturns(prices) {
  return {
    '1m': calcReturn(prices, 30),
    '3m': calcReturn(prices, 90),
    '6m': calcReturn(prices, 180),
    '1y': calcReturn(prices, 365),
    '3y': calcReturn(prices, 1095),
    '5y': calcReturn(prices, 1825),
  };
}

export function calcVolatility(prices) {
  if (!prices || prices.length < 10) return null;
  const dailyReturns = [];
  for (let i = 1; i < prices.length; i++) {
    dailyReturns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close);
  }
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / dailyReturns.length;
  return +(Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(2);
}

export function calcMaxDrawdown(prices) {
  if (!prices?.length) return null;
  let peak = prices[0].close;
  let maxDD = 0;
  for (const { close } of prices) {
    if (close > peak) peak = close;
    const dd = (peak - close) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return +(maxDD * 100).toFixed(2);
}

export function calcSharpe(prices) {
  if (!prices || prices.length < 10) return null;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);
  if (std === 0) return null;
  const riskFreeDaily = 0.045 / 252;
  return +((mean - riskFreeDaily) / std * Math.sqrt(252)).toFixed(2);
}

export function calcCAGR(prices, years) {
  if (!prices || prices.length < 2) return null;
  const start = prices[0].close;
  const end = prices[prices.length - 1].close;
  return +(((end / start) ** (1 / years) - 1) * 100).toFixed(2);
}

// RSI calculation for momentum indicator
export function calcRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null;
  const recent = prices.slice(-period - 1);
  let gains = 0, losses = 0;
  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i].close - recent[i - 1].close;
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

// Simple Moving Average
export function calcSMA(prices, period) {
  if (!prices || prices.length < period) return null;
  const recent = prices.slice(-period);
  return +(recent.reduce((s, p) => s + p.close, 0) / period).toFixed(2);
}

export function riskLevel(volatility) {
  if (volatility === null || volatility === undefined) return 'Unknown';
  if (volatility < 12) return 'Low';
  if (volatility < 25) return 'Medium';
  return 'High';
}
