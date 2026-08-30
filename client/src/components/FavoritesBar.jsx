export default function FavoritesBar({ favorites, onAdd, onUnfavorite, selected }) {
  if (!favorites.length) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center py-2">
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex-shrink-0">★ Favorites</span>
      {favorites.map(sym => {
        const isAdded = selected.includes(sym);
        return (
          <div key={sym} className="flex items-center group">
            <button
              onClick={() => !isAdded && selected.length < 5 && onAdd(sym)}
              disabled={isAdded || selected.length >= 5}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-l-xl text-xs font-semibold border-y border-l transition-all ${
                isAdded
                  ? 'bg-blue-900/20 border-blue-700/40 text-blue-400 cursor-default'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-yellow-500/60 hover:text-white cursor-pointer'
              }`}
            >
              {sym.replace('.NS', '')}
              {isAdded && <span className="text-blue-500 ml-0.5">✓</span>}
            </button>
            <button
              onClick={() => onUnfavorite(sym)}
              className="px-1.5 py-1.5 rounded-r-xl text-xs border-y border-r border-slate-600 bg-slate-800 text-slate-600 hover:text-red-400 hover:border-slate-500 transition-all"
              title="Remove from favorites"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
