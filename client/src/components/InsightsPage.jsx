import { useState } from 'react';

const FUTURE_PROOF = [
  {
    name: 'NVIDIA (NVDA)',
    score: 5,
    verdict: 'Extremely Future-Proof',
    color: 'emerald',
    reasons: [
      'GPUs power every major AI model — ChatGPT, Gemini, Claude all run on NVIDIA hardware.',
      'CUDA software ecosystem took 15+ years to build and is nearly impossible to replicate, creating a deep moat.',
      'Data center revenue grew 400%+ in 2 years and is still in early innings as AI adoption expands.',
      'Expanding into robotics (Jetson), autonomous vehicles, and healthcare AI — multiple growth vectors.',
    ],
    risks: [
      'Extremely high valuation — any slowdown in AI spending could cause a sharp correction.',
      'AMD and Intel are investing billions to catch up on AI chips.',
      'US export controls to China limit a significant revenue market.',
    ],
  },
  {
    name: 'Microsoft (MSFT)',
    score: 5,
    verdict: 'Extremely Future-Proof',
    color: 'emerald',
    reasons: [
      'Azure is the #2 cloud provider and growing faster than AWS — enterprise contracts lock in revenue for years.',
      'OpenAI partnership gives Microsoft Copilot AI across Office, Teams, Windows — 1 billion+ users.',
      'Gaming (Xbox + Activision Blizzard), LinkedIn, and GitHub create diversified revenue streams.',
      'Consistent dividend growth for 20+ years with massive free cash flow generation.',
    ],
    risks: [
      'Antitrust scrutiny in the EU and US over cloud and AI dominance.',
      'Slowdown in enterprise tech spending could dampen Azure growth.',
    ],
  },
  {
    name: 'Apple (AAPL)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'Services revenue (App Store, iCloud, Apple TV+) crossed $100B/year and carries ~75% gross margins.',
      'iPhone ecosystem creates switching costs — 1 billion+ active iPhones, growing install base.',
      'Apple Vision Pro and spatial computing position Apple for the next computing platform shift.',
      'Strongest brand loyalty in the world with consistent pricing power.',
    ],
    risks: [
      'Heavy dependence on iPhone sales (~50% of revenue) which are slowing in China.',
      'Regulatory pressure forcing App Store changes could reduce services margins.',
      'Slow to move into AI compared to Google and Microsoft.',
    ],
  },
  {
    name: 'Alphabet / Google (GOOGL)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'Search still handles 90% of global queries — an almost unassailable network effect.',
      'YouTube is the world\'s largest video platform and #2 search engine by volume.',
      'Google Cloud is the fastest growing of the big 3 and profitable for the first time.',
      'DeepMind and Gemini AI models are world-class — Google has more AI compute than almost anyone.',
    ],
    risks: [
      'AI-powered search (ChatGPT, Perplexity) is the first real threat to Google\'s core business in 25 years.',
      'Massive antitrust case could force changes to how Google distributes its search engine.',
    ],
  },
  {
    name: 'Amazon (AMZN)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'AWS (Amazon Web Services) is the #1 cloud provider globally with ~30% market share.',
      'Prime membership creates a flywheel: shipping → video → music → grocery → pharmacy.',
      'Advertising business is now a $50B/year profit machine growing 20%+ annually.',
      'Expanding into healthcare, logistics, and satellite internet (Kuiper).',
    ],
    risks: [
      'Retail segment has thin margins and is vulnerable to economic downturns.',
      'Antitrust cases in multiple countries around marketplace dominance.',
    ],
  },
  {
    name: 'Gold (GLD / IAU)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'Central banks worldwide bought record gold in 2022–2024, diversifying away from USD reserves.',
      'Finite supply — all gold ever mined fits in ~3.5 Olympic swimming pools. Cannot be inflated.',
      '5,000-year track record as a store of value across every civilization and currency collapse.',
      'Performs well during inflation spikes, currency crises, and geopolitical conflict.',
    ],
    risks: [
      'Earns no dividends or interest — you only profit from price appreciation.',
      'Can underperform for years during periods of strong economic growth and rising rates.',
    ],
  },
  {
    name: 'Reliance Industries (RELIANCE.NS)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'Jio is India\'s largest telecom with 450M+ subscribers — positioned for 5G era.',
      'JioMart + Reliance Retail is building India\'s largest consumer super-app and retail network.',
      'New Energy business investing $10B in solar, green hydrogen, and battery storage.',
      'Petrochemicals still generate massive cash flows that fund diversification.',
    ],
    risks: [
      'Conglomerate complexity makes it hard to value individual businesses.',
      'Regulatory scrutiny in telecom and retail continues to increase.',
    ],
  },
  {
    name: 'HDFC Bank (HDFCBANK.NS)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'India\'s largest private bank with the best asset quality in the sector over 25 years.',
      'India is underbanked — formal credit penetration is <60%, massive room to grow.',
      'Digital banking transformation with HDFC app processing millions of transactions daily.',
      'Post-merger with HDFC Ltd, loan book expanded by 30% with strong mortgage growth runway.',
    ],
    risks: [
      'Post-merger integration challenges have caused temporary NIM compression.',
      'Highly sensitive to RBI rate changes and rural economic conditions.',
    ],
  },
  {
    name: 'Infosys (INFY.NS) / TCS (TCS.NS)',
    score: 3,
    verdict: 'Future-Proof',
    color: 'amber',
    reasons: [
      'India\'s IT exports are a structural trend — global companies will always outsource to reduce costs.',
      'Expanding into AI services, cloud migration, and digital transformation — not just labor arbitrage.',
      'Strong dollar-earning businesses that hedge against INR depreciation for Indian investors.',
    ],
    risks: [
      'AI tools are automating the basic coding work that used to require large offshore teams.',
      'Revenue growth has slowed to single digits as the easy outsourcing wave matures.',
      'Highly exposed to US economic cycles — a US recession hits Indian IT hard.',
    ],
  },
  {
    name: 'Silver (SLV / SIVR)',
    score: 3,
    verdict: 'Future-Proof',
    color: 'amber',
    reasons: [
      'Silver is essential for solar panels — each panel uses ~20g of silver. Renewable energy demand is rising fast.',
      'Used in EVs, 5G infrastructure, semiconductors, and medical equipment.',
      'Historically follows gold up but with higher volatility and upside.',
    ],
    risks: [
      'Over 50% of demand is industrial — silver gets hit harder than gold during recessions.',
      'Extremely volatile — can drop 30–50% in a downturn and take years to recover.',
    ],
  },
  {
    name: 'S&P 500 Index Funds (VOO / SPY / IVV)',
    score: 5,
    verdict: 'Extremely Future-Proof',
    color: 'emerald',
    reasons: [
      'Over 100-year track record — has survived every crisis, war, pandemic, and depression.',
      'Self-cleaning mechanism: failing companies exit the index, winners get added automatically.',
      'Average annual return of ~10% over any 20-year period in history.',
      'Virtually zero management cost (0.03% for VOO) — almost all returns go to you.',
    ],
    risks: [
      'US-centric — if the US loses economic dominance, returns could decline over very long periods.',
      'Sector concentration: top 10 companies = 35%+ of the index. A tech crash hits hard.',
    ],
  },
  {
    name: 'Nifty 50 ETFs (India)',
    score: 4,
    verdict: 'Very Future-Proof',
    color: 'blue',
    reasons: [
      'India is the world\'s fastest growing major economy and is projected to be the 3rd largest by 2030.',
      'Favorable demographics — median age 28, growing middle class, rising consumption.',
      'Nifty 50 has delivered ~12–13% CAGR historically, outperforming most global indices.',
      'Self-cleaning index — weak companies are replaced by stronger ones automatically.',
    ],
    risks: [
      'INR depreciation erodes returns for dollar-denominated investors.',
      'Political and regulatory risk is higher than developed markets.',
      'Monsoon cycles and rural income heavily impact several index constituents.',
    ],
  },
];

const SIP_DATA = {
  whatIsSIP: `A SIP (Systematic Investment Plan) means investing a fixed amount every month — for example, ₹5,000 on the 5th of every month into a Nifty 50 ETF. You don't try to time the market. You just keep investing regardless of whether the market is up or down.`,
  whatIsLumpSum: `A lump sum investment means putting a large amount in all at once — for example, investing ₹6 lakhs in one shot after getting a bonus. All your money starts working from day one, but you're also exposed to the market's current price immediately.`,
  advantages: [
    {
      title: 'SIP Advantages',
      color: 'blue',
      points: [
        'Rupee cost averaging — you buy more units when markets fall, fewer when they rise, lowering your average cost over time.',
        'Removes emotional decision-making — no panic selling or greedy buying, the process is automatic.',
        'Suits salaried investors who don\'t have a large corpus upfront.',
        'Builds discipline — monthly investing becomes a habit, similar to an EMI for your future.',
        'Works especially well in volatile markets where timing is nearly impossible.',
      ],
    },
    {
      title: 'Lump Sum Advantages',
      color: 'amber',
      points: [
        'Maximum time in the market — all your money compounds from day one.',
        'Mathematically better IF you invest at a market low or when valuations are reasonable.',
        'Lower transaction costs — one purchase instead of 120 monthly purchases.',
        'Best for windfall gains: inheritance, bonus, sale of property.',
        'If you have strong conviction that markets are undervalued, lump sum captures the full upside.',
      ],
    },
  ],
  whenToChoose: [
    { scenario: 'I receive a monthly salary', choice: 'SIP', reason: 'You get money monthly, so invest monthly. Natural fit.' },
    { scenario: 'I got a large bonus / inheritance', choice: 'Lump Sum', reason: 'Put it to work immediately. Waiting "for a dip" usually costs more than just investing.' },
    { scenario: 'Markets just crashed 30%+', choice: 'Lump Sum', reason: 'Valuations are attractive. Maximum entry point. Add more if you can.' },
    { scenario: 'Markets are at all-time highs', choice: 'SIP', reason: 'You don\'t know if highs will go higher. Spread risk with regular investing.' },
    { scenario: 'I\'m a first-time investor', choice: 'SIP', reason: 'Build confidence. Learn without risking everything on one day\'s price.' },
    { scenario: 'I want to retire in 5 years', choice: 'SIP into debt + equity mix', reason: 'Reduce exposure to timing risk as your horizon shortens.' },
    { scenario: 'I have a 15–20 year horizon', choice: 'Both — SIP monthly + lump sum on dips', reason: 'Long horizons forgive bad timing; adding on dips accelerates returns.' },
  ],
  sipMath: `If you invest ₹10,000 per month for 20 years at 12% annual return (Nifty 50 average), you invest ₹24 lakhs total and end up with approximately ₹98 lakhs — a 4x multiplier on your invested capital purely through compounding and time.`,
};

function ScoreStars({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i <= score ? 'bg-current' : 'bg-slate-700'}`}
        />
      ))}
    </div>
  );
}

function StockCard({ item }) {
  const [open, setOpen] = useState(false);
  const colors = {
    emerald: { border: 'border-emerald-700/60', badge: 'bg-emerald-900/30 text-emerald-400 border-emerald-700', dot: 'text-emerald-400' },
    blue:    { border: 'border-blue-700/60',    badge: 'bg-blue-900/30 text-blue-400 border-blue-700',       dot: 'text-blue-400' },
    amber:   { border: 'border-amber-700/60',   badge: 'bg-amber-900/30 text-amber-400 border-amber-700',    dot: 'text-amber-400' },
    red:     { border: 'border-red-700/60',     badge: 'bg-red-900/30 text-red-400 border-red-700',          dot: 'text-red-400' },
  };
  const c = colors[item.color] || colors.blue;

  return (
    <div className={`bg-slate-800/80 rounded-2xl border ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-bold text-white text-base">{item.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${c.badge}`}>{item.verdict}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={c.dot}>
            <ScoreStars score={item.score} />
          </div>
          <span className="text-slate-500 text-lg">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-700/40 pt-4">
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Why it's future-proof</h4>
            <ul className="space-y-2">
              {item.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Risks to watch</h4>
            <ul className="space-y-2">
              {item.risks.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">!</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InsightsPage() {
  const [section, setSection] = useState('future');

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSection('future')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            section === 'future'
              ? 'bg-purple-900/30 border-purple-600 text-purple-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          }`}
        >
          Future-Proof Analysis
        </button>
        <button
          onClick={() => setSection('sip')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            section === 'sip'
              ? 'bg-blue-900/30 border-blue-600 text-blue-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          }`}
        >
          SIP vs Lump Sum
        </button>
      </div>

      {section === 'future' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5">
            <h2 className="text-lg font-bold text-white mb-1">How Future-Proof Is Each Investment?</h2>
            <p className="text-slate-400 text-sm">
              Future-proofing measures how likely an asset is to remain relevant and grow in value over the next 10–20 years.
              Five squares = extremely future-proof. Click any card to see detailed reasoning.
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex gap-0.5 items-center text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-current mr-1 inline-block" />
                Extremely Future-Proof (5/5)
              </span>
              <span className="flex gap-0.5 items-center text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-current mr-1 inline-block" />
                Very Future-Proof (4/5)
              </span>
              <span className="flex gap-0.5 items-center text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-current mr-1 inline-block" />
                Future-Proof (3/5)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {FUTURE_PROOF.map(item => (
              <StockCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      )}

      {section === 'sip' && (
        <div className="space-y-5">
          {/* What is each */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/20 border border-blue-700/60 rounded-2xl p-5">
              <h3 className="text-base font-bold text-blue-300 mb-2">What is a SIP?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{SIP_DATA.whatIsSIP}</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-700/60 rounded-2xl p-5">
              <h3 className="text-base font-bold text-amber-300 mb-2">What is a Lump Sum?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{SIP_DATA.whatIsLumpSum}</p>
            </div>
          </div>

          {/* SIP math highlight */}
          <div className="bg-emerald-900/20 border border-emerald-700/60 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">The Power of SIP — Real Numbers</h3>
            <p className="text-white text-sm leading-relaxed">{SIP_DATA.sipMath}</p>
          </div>

          {/* Advantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SIP_DATA.advantages.map(adv => {
              const c = adv.color === 'blue'
                ? { header: 'text-blue-400', dot: 'text-blue-400', border: 'border-blue-700/40' }
                : { header: 'text-amber-400', dot: 'text-amber-400', border: 'border-amber-700/40' };
              return (
                <div key={adv.title} className={`bg-slate-800/80 rounded-2xl border ${c.border} p-5`}>
                  <h3 className={`text-sm font-bold ${c.header} uppercase tracking-wider mb-3`}>{adv.title}</h3>
                  <ul className="space-y-2">
                    {adv.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className={`${c.dot} mt-0.5 flex-shrink-0`}>▶</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* When to choose */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Which Should You Choose? — Scenario Guide</h3>
            </div>
            <div className="divide-y divide-slate-700/40">
              {SIP_DATA.whenToChoose.map((row, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3">
                  <div className="flex-1 text-sm text-slate-300">{row.scenario}</div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      row.choice.startsWith('SIP')
                        ? 'bg-blue-900/30 text-blue-400 border-blue-700'
                        : row.choice.startsWith('Lump')
                        ? 'bg-amber-900/30 text-amber-400 border-amber-700'
                        : 'bg-purple-900/30 text-purple-400 border-purple-700'
                    }`}>
                      {row.choice}
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-slate-500 text-right">{row.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom line */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">The Bottom Line</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              For most people, <span className="text-blue-400 font-semibold">SIP is the right default</span> — it removes emotion, builds discipline, and works even when you can't time the market.
              Reserve lump sum investing for genuine windfalls or for adding extra during sharp market corrections.
              The best strategy is often a combination: a monthly SIP as your base, topped up with lump sums whenever the market drops 10–15%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
