import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SUGGESTIONS = [
  'Which one would you pick for SIP?',
  'Which has the best risk-adjusted returns?',
  'Is any of these overvalued right now?',
  'Which is safest for a beginner?',
  'Compare the volatility of these',
];

const GENERAL_SUGGESTIONS = [
  'Is gold a good investment right now?',
  'SIP vs lump sum — which is better?',
  'What is the Sharpe ratio?',
  'Should I invest in Nifty 50 ETFs?',
];

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4 px-1">
      {[0, 150, 300].map(delay => (
        <div
          key={delay}
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export default function AIChatButton({ stocks = [] }) {
  const hasStocks = stocks.length > 0;
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: hasStocks
      ? `Hey! I can see you're looking at ${stocks.map(s => s.symbol.replace('.NS', '')).join(', ')}. Ask me anything — I'll give you my honest take.`
      : "Hey! I'm your AI stock analyst. Add some stocks in the Compare tab and I'll give you my honest opinion on them.",
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/ai/chat', { message: msg, stocks });
      setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
    } catch (e) {
      const err = e.response?.data?.error || 'Could not reach the AI. Check that GROQ_API_KEY is set on the server.';
      setMessages(m => [...m, { role: 'assistant', text: `⚠️ ${err}` }]);
    }
    setLoading(false);
  };

  const suggestions = hasStocks ? SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Ask AI"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
          open ? 'bg-slate-700 border border-slate-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: 460 }}>

          {/* Header */}
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2.5 flex-shrink-0">
            <span className="text-xl">🤖</span>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">AI Stock Analyst</div>
              <div className="text-slate-500 text-xs">Powered by Groq · Opinions, not advice</div>
            </div>
            {hasStocks && (
              <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                {stocks.slice(0, 3).map(s => (
                  <span key={s.symbol} className="text-xs px-1.5 py-0.5 bg-blue-900/40 border border-blue-700/40 text-blue-300 rounded">
                    {s.symbol.replace('.NS', '')}
                  </span>
                ))}
                {stocks.length > 3 && <span className="text-xs text-slate-500">+{stocks.length - 3}</span>}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
              {suggestions.slice(0, 3).map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-800 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={hasStocks ? 'Ask about these stocks…' : 'Ask anything about investing…'}
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
