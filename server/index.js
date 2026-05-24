import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import stocksRouter from './routes/stocks.js';
import recommendationsRouter from './routes/recommendations.js';
import metalsRouter from './routes/metals.js';
import indiaRouter from './routes/india.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/stocks', stocksRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/metals', metalsRouter);
app.use('/api/india', indiaRouter);
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/test', async (req, res) => {
  try {
    const { fetchSymbol } = await import('./services/yahooFinance.js');
    const { quote } = await fetchSymbol('GLD');
    res.json({ success: true, price: quote?.regularMarketPrice, name: quote?.shortName });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Serve built React app in production
const distPath = join(__dirname, '..', 'client', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
