import { useState, useMemo, useCallback } from 'react';
import { RefreshCw, Tv2, Clock, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import FilterBar, { type Filters } from './components/FilterBar';
import SourceSelector from './components/SourceSelector';
import { useChannels } from './hooks/useChannels';
import { useFavorites } from './hooks/useFavorites';
import { IPTV_SOURCES } from './lib/iptvSources';
import type { Channel } from './types/iptv';

const DEFAULT_FILTER = 'all';
const PAGE_SIZE = 80;

export default function App() {
  const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: '', language: '', country: '', category: '', showFavorites: false,
  });

  const { channels, loading, error, refresh, lastUpdated } = useChannels(currentFilter);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setCurrentFilter(filter);
    setPage(0);
    setActiveChannel(null);
  }, []);

  const filtered = useMemo(() => {
    let list = filters.showFavorites ? favorites : channels;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (filters.language) list = list.filter(c => c.language === filters.language);
    if (filters.country) list = list.filter(c => c.country === filters.country);
    if (filters.category) list = list.filter(c => c.category === filters.category);
    return list;
  }, [channels, favorites, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col flex-shrink-0 bg-gray-900 border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <Tv2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">IPTV Stream</h1>
              <p className="text-[10px] text-gray-500">{channels.length.toLocaleString()} channels</p>
            </div>
          </div>
          <div className="flex-1" />
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all disabled:opacity-40"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter selector */}
        <div className="px-3 py-2 border-b border-white/5">
          <SourceSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
          {loading ? (
            <div className="flex items-center gap-1.5 text-[10px] text-sky-400">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Loading channels…
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-[10px] text-red-400">
              <WifiOff className="w-3 h-3" />
              {error}
            </div>
          ) : lastUpdated ? (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <Wifi className="w-3 h-3 text-emerald-500" />
              Updated {formatTime(lastUpdated)} · auto-refresh every 6h
            </div>
          ) : null}
          {lastUpdated && (
            <div className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
              <Clock className="w-3 h-3" />
              {formatTime(lastUpdated)}
            </div>
          )}
        </div>

        {/* Filters */}
        <FilterBar channels={channels} filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Results count */}
        <div className="px-3 py-1.5 text-[10px] text-gray-600 border-b border-white/5">
          {filtered.length.toLocaleString()} results
          {totalPages > 1 && ` · page ${page + 1}/${totalPages}`}
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading && paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-3 mt-12 text-gray-600">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="text-xs">Loading channels…</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-2 mt-12 text-gray-600">
              <Tv2 className="w-8 h-8 opacity-30" />
              <p className="text-xs">No channels found</p>
            </div>
          ) : (
            <div className="px-1.5 space-y-0.5">
              {paginated.map(ch => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  isActive={activeChannel?.id === ch.id}
                  isFavorite={isFavorite(ch.id)}
                  onSelect={setActiveChannel}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-gray-500">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-black">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-gray-800 hover:bg-gray-700 border border-white/10 border-l-0 rounded-r-lg flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Player area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <VideoPlayer channel={activeChannel} />
          </div>

          {/* Channel info bar below player */}
          {activeChannel && (
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-900 border-t border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                {activeChannel.logo && (
                  <img src={activeChannel.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-black/40 p-1" />
                )}
                <div>
                  <h2 className="font-semibold text-white text-sm">{activeChannel.name}</h2>
                  <p className="text-xs text-gray-500">
                    {[activeChannel.category, activeChannel.country, activeChannel.language]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium tracking-wide">LIVE</span>
              </div>
            </div>
          )}
        </div>

        {/* Welcome screen when no channel selected */}
        {!activeChannel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-sky-600/10 border border-sky-500/10 flex items-center justify-center mx-auto">
                <Tv2 className="w-10 h-10 text-sky-500 opacity-40" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-500">Select a Channel</h2>
                <p className="text-sm text-gray-700 mt-1">Pick a channel from the sidebar to start watching</p>
              </div>
              {channels.length > 0 && (
                <p className="text-xs text-gray-800">{channels.length.toLocaleString()} channels available</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}