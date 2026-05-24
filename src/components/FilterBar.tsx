import { Search, Globe, Flag, Tag, X } from 'lucide-react';
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

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean))).sort();
}

export default function FilterBar({ channels, filters, onFiltersChange }: FilterBarProps) {
  const languages = unique(channels.map(c => c.language));
  const countries = unique(channels.map(c => c.country));
  const categories = unique(channels.map(c => c.category));

  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onFiltersChange({ ...filters, [key]: (e.target as HTMLInputElement).value });
  };

  const hasActiveFilters = filters.language || filters.country || filters.category || filters.search || filters.showFavorites;

  const clear = () => onFiltersChange({ search: '', language: '', country: '', category: '', showFavorites: false });

  return (
    <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search channels…"
          value={filters.search}
          onChange={set('search')}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
        />
      </div>

      {/* Filter row */}
      <div className="flex gap-2 flex-wrap">
        {/* Language */}
        <div className="relative flex-1 min-w-[100px]">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          <select
            value={filters.language}
            onChange={set('language')}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
          >
            <option value="">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Country */}
        <div className="relative flex-1 min-w-[100px]">
          <Flag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          <select
            value={filters.country}
            onChange={set('country')}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="relative flex-1 min-w-[100px]">
          <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          <select
            value={filters.category}
            onChange={set('category')}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Favorites toggle + clear */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onFiltersChange({ ...filters, showFavorites: !filters.showFavorites })}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
            filters.showFavorites
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
          }`}
        >
          <span>♥</span> Favorites
        </button>
        {hasActiveFilters && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}