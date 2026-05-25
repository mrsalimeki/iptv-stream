import { useState, useMemo, useCallback, useEffect } from 'react';
import { RefreshCw, Tv2, Search, Heart, Globe, ChevronLeft, ChevronRight, Wifi, WifiOff, Menu, X } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import SourceSelector from './components/SourceSelector';
import { useChannels } from './hooks/useChannels';
import { useFavorites } from './hooks/useFavorites';
import type { Channel } from './types/iptv';

const DEFAULT_FILTER = 'all';
const PAGE_SIZE = 30;

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
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside
        className={`fixed md:static inset-y-0 left-0 flex flex-col flex-shrink-0 w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-cyan-500/20 transition-transform duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 border-b border-cyan-500/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Tv2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">IPTV Stream</h1>
              <p className="text-xs text-cyan-400/80">{channels.length.toLocaleString()} channels</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-cyan-500/20 flex-shrink-0">
          <SourceSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
        </div>

        <div className="px-4 py-2 border-b border-cyan-500/20 text-xs flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Loading channels...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400">
              <WifiOff className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : lastUpdated ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span>Updated {formatTime(lastUpdated)}</span>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-3 border-b border-cyan-500/20 space-y-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search channels..."
              value={filters.search}
              onChange={e => handleFiltersChange({ ...filters, search: e.target.value })}
              className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filters.country}
              onChange={e => handleFiltersChange({ ...filters, country: e.target.value })}
              className="w-full appearance-none bg-slate-800/50 border border-cyan-500/30 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all cursor-pointer"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleFiltersChange({ ...filters, showFavorites: !filters.showFavorites })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
              filters.showFavorites
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-800/50 border-cyan-500/30 text-slate-300 hover:border-cyan-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${filters.showFavorites ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>

        <div className="px-4 py-2 text-xs text-slate-500 border-b border-cyan-500/20 flex-shrink-0">
          {filtered.length.toLocaleString()} results {totalPages > 1 && `• Page ${page + 1}/${totalPages}`}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-32 text-slate-600">
              <div className="w-6 h-6 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              <p className="text-xs">Loading...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-32 text-slate-600">
              <Tv2 className="w-8 h-8 opacity-30" />
              <p className="text-xs">No channels</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
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
          <div className="flex items-center justify-between px-3 py-2 border-t border-cyan-500/20 flex-shrink-0">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-3 py-2 border-t border-cyan-500/20 flex-shrink-0">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </aside>

      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-4 left-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-all border border-cyan-500/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full bg-black">
            <VideoPlayer channel={activeChannel} />
          </div>

          {activeChannel && (
            <div className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-cyan-500/20 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {activeChannel.logo && (
                  <img
                    src={activeChannel.logo}
                    alt=""
                    className="w-12 h-12 rounded-lg object-contain bg-slate-800 p-1 flex-shrink-0 border border-cyan-500/20"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="font-bold text-white text-base truncate">{activeChannel.name}</h2>
                  <p className="text-xs text-cyan-400/70 truncate">
                    {[activeChannel.category, activeChannel.country, activeChannel.language]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-red-600/30 px-3 py-1.5 rounded-full border border-red-500/30">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!activeChannel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <Tv2 className="w-12 h-12 text-cyan-400 opacity-50" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">Select a Channel</h2>
                <p className="text-sm text-slate-400 mt-2">Pick a channel from the sidebar to start watching</p>
              </div>
              {channels.length > 0 && (
                <p className="text-xs text-slate-600">{channels.length.toLocaleString()} channels available</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}