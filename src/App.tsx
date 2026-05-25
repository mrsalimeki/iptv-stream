import { useState, useMemo, useCallback, useEffect } from 'react';
import { RefreshCw, Tv2, Search, Heart, Globe, ChevronLeft, ChevronRight, Wifi, WifiOff, Menu, X, Play, Grid3x3 } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import SourceSelector from './components/SourceSelector';
import { useChannels } from './hooks/useChannels';
import { useFavorites } from './hooks/useFavorites';
import type { Channel } from './types/iptv';

const DEFAULT_FILTER = 'all';
const PAGE_SIZE = 24;

interface Filters {
  search: string;
  country: string;
  showFavorites: boolean;
}

export default function App() {
  const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filters, setFilters] = useState<Filters>({
    search: '', country: '', showFavorites: false,
  });

  const { channels, loading, error, refresh, lastUpdated } = useChannels(currentFilter);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (activeChannel && screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock('landscape').catch(() => {});
    } else if (!activeChannel && screen.orientation && 'unlock' in screen.orientation) {
      (screen.orientation as any).unlock().catch(() => {});
    }
  }, [activeChannel]);

  const handleFilterChange = useCallback((filter: string) => {
    setCurrentFilter(filter);
    setPage(0);
    setActiveChannel(null);
  }, []);

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
    setPage(0);
  }, []);

  const countries = useMemo(() => {
    return Array.from(new Set(channels.map(c => c.country).filter(Boolean))).sort();
  }, [channels]);

  const filtered = useMemo(() => {
    let list = filters.showFavorites ? favorites : channels;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (filters.country) list = list.filter(c => c.country === filters.country);
    return list;
  }, [channels, favorites, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      <aside
        className={`fixed md:static inset-y-0 left-0 flex flex-col flex-shrink-0 w-72 bg-white border-r border-slate-200 transition-transform duration-300 z-30 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Tv2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">IPTV Stream</h1>
              <p className="text-xs text-blue-600 font-medium">{channels.length.toLocaleString()} channels</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <SourceSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
        </div>

        <div className="px-4 py-3 border-b border-slate-200 text-xs flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-medium">Loading channels...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500">
              <WifiOff className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : lastUpdated ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span>Updated {formatTime(lastUpdated)}</span>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-4 border-b border-slate-200 space-y-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={filters.search}
              onChange={e => handleFiltersChange({ ...filters, search: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filters.country}
              onChange={e => handleFiltersChange({ ...filters, country: e.target.value })}
              className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleFiltersChange({ ...filters, showFavorites: !filters.showFavorites })}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
              filters.showFavorites
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${filters.showFavorites ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>

        <div className="px-4 py-3 text-xs font-medium text-slate-600 border-b border-slate-200 flex-shrink-0">
          {filtered.length.toLocaleString()} results {totalPages > 1 && `• Page ${page + 1}/${totalPages}`}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-32 text-slate-500">
              <div className="w-6 h-6 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
              <p className="text-xs font-medium">Loading...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-32 text-slate-500">
              <Tv2 className="w-8 h-8 opacity-40" />
              <p className="text-xs font-medium">No channels</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {paginated.map(ch => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  isActive={activeChannel?.id === ch.id}
                  isFavorite={isFavorite(ch.id)}
                  onSelect={() => {
                    setActiveChannel(ch);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-3 border-t border-slate-200 flex-shrink-0 bg-slate-50">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-600">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-3 py-3 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all text-sm shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </aside>

      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            {activeChannel && (
              <div className="flex items-center gap-3 min-w-0">
                {activeChannel.logo && (
                  <img
                    src={activeChannel.logo}
                    alt=""
                    className="w-10 h-10 rounded-lg object-contain bg-slate-100 p-1 flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 text-sm truncate">{activeChannel.name}</h2>
                  <p className="text-xs text-slate-500 truncate">{activeChannel.category}</p>
                </div>
              </div>
            )}
          </div>

          {activeChannel && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-red-100 px-3 py-1.5 rounded-full border border-red-300">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 text-xs font-bold">LIVE</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full bg-black">
            <VideoPlayer channel={activeChannel} />
          </div>
        </div>

        {!activeChannel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="text-center space-y-6">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 flex items-center justify-center mx-auto">
                <Play className="w-14 h-14 text-blue-600 fill-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Select a Channel</h2>
                <p className="text-slate-600 mt-2">Choose from {channels.length.toLocaleString()} available channels</p>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">Use the sidebar to browse channels, search, or filter by country</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}