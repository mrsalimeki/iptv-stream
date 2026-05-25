import { Search, X, Heart } from 'lucide-react';
import type { Channel } from '../types/iptv';

export interface Filters {
  search: string;
  language: string;
  country: string;
  category: string;
  showFavorites: boolean;
}

interface FilterBarProps {
  channels: Channel[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

export default function FilterBar({ channels, filters, onFiltersChange }: FilterBarProps) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, [key]: e.target.value });
  };

  const hasActiveFilters = filters.search || filters.showFavorites;

  const clear = () => onFiltersChange({ search: '', language: '', country: '', category: '', showFavorites: false });

  return (
    <div className="flex flex-col gap-2 px-3 py-3 border-b border-slate-700/50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search channels..."
          value={filters.search}
          onChange={set('search')}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onFiltersChange({ ...filters, showFavorites: !filters.showFavorites })}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
            filters.showFavorites
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filters.showFavorites ? 'fill-current' : ''}`} />
          <span>Favorites</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}