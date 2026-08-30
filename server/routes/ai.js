import { Router } from 'express';

const router = Router();

const SYSTEM_PROMPT = `You are a casual, friendly stock market analyst inside an app called Easy Investing.
Give honest, balanced opinions. Use phrases like "I think", "probably", "in my opinion", "it seems like", "honestly".
Keep responses short — 2 to 4 sentences max. Be direct, not salesy.
Always end with a brief reminder that this is just your opinion, not financial advice.
If stock data is provided, reference specific numbers to back up your points.`;

router.post('/chat', async (req, res) => {
  const { message, stocks } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'No message provided' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI not configured — add GROQ_API_KEY to your .env file' });

  let context = '';
  if (stocks?.length) {
    context = '\n\nStocks currently being viewed:\n' + stocks.map(s =>
      `• ${s.symbol} (${s.name}): ₹/$ ${s.currentPrice?.toFixed(2)}, 1Y return ${s.returns?.['1y']?.toFixed(1) ?? '—'}%, Vol ${s.volatility?.toFixed(1) ?? '—'}%, Sharpe ${s.sharpe?.toFixed(2) ?? '—'}, Max Drawdown -${s.maxDrawdown?.toFixed(1) ?? '—'}%, 5Y CAGR ${s.cagr5y ?? '—'}%`
    ).join('\n');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + context },
          { role: 'user', content: message },
        ],
        max_tokens: 280,
        temperature: 0.75,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from AI');
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
