import { useState, useMemo, useCallback, useEffect } from 'react';
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
const PAGE_SIZE = 50;

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

  useEffect(() => {
    if (activeChannel && screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock('landscape').catch(() => {});
    } else if (!activeChannel && screen.orientation && 'unlock' in screen.orientation) {
      (screen.orientation as any).unlock().catch(() => {});
    }
  }, [activeChannel]);

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
    return list;
  }, [channels, favorites, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <aside
        className={`flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-700/50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-slate-700/50 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
            <Tv2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-white leading-tight truncate">IPTV</h1>
            <p className="text-[9px] text-slate-500 truncate">{channels.length.toLocaleString()} channels</p>
          </div>
          <div className="flex-1" />
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-all disabled:opacity-40 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="px-2 py-1.5 border-b border-slate-700/50 flex-shrink-0">
          <SourceSelector currentFilter={currentFilter} onFilterChange={handleFilterChange} />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 border-b border-slate-700/50 text-[9px] flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-1 text-cyan-400">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1 text-red-400">
              <WifiOff className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          ) : lastUpdated ? (
            <div className="flex items-center gap-1 text-slate-600 truncate">
              <Wifi className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
              <span className="truncate">Updated {formatTime(lastUpdated)}</span>
            </div>
          ) : null}
        </div>

        <div className="px-2 py-2 border-b border-slate-700/50 flex-shrink-0">
          <FilterBar channels={channels} filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <div className="px-3 py-1 text-[9px] text-slate-600 border-b border-slate-700/50 flex-shrink-0">
          {filtered.length.toLocaleString()} results {totalPages > 1 && `• ${page + 1}/${totalPages}`}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-2 mt-6 text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <p className="text-[9px]">Loading...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 mt-6 text-slate-600">
              <Tv2 className="w-5 h-5 opacity-30" />
              <p className="text-[9px]">No channels</p>
            </div>
          ) : (
            <div className="px-1 py-0.5 space-y-0.5">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-700/50 flex-shrink-0">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[9px] text-slate-500">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative bg-black">
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-4 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 border-l-0 rounded-r flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
        >
          {sidebarOpen ? <ChevronLeft className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full">
            <VideoPlayer channel={activeChannel} />
          </div>

          {activeChannel && (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-t border-slate-700/50 flex-shrink-0 min-h-[64px]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {activeChannel.logo && (
                  <img src={activeChannel.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-800 p-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h2 className="font-semibold text-white text-sm truncate">{activeChannel.name}</h2>
                  <p className="text-xs text-slate-500 truncate">
                    {[activeChannel.category, activeChannel.country, activeChannel.language]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-red-600/90 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!activeChannel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Tv2 className="w-8 h-8 text-cyan-500 opacity-40" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-500">Select a Channel</h2>
                <p className="text-xs text-slate-700 mt-1">Pick from the sidebar</p>
              </div>
              {channels.length > 0 && (
                <p className="text-[10px] text-slate-800">{channels.length.toLocaleString()} available</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}