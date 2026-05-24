import { useState } from 'react';
import { ChevronDown, Globe, Radio, Plus, Trash2 } from 'lucide-react';
import { IPTV_SOURCES, COUNTRY_SOURCES, COUNTRY_NAMES } from '../lib/iptvSources';

interface SourceSelectorProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function SourceSelector({ currentFilter, onFilterChange }: SourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'lang' | 'country'>('lang');

  const currentName =
    IPTV_SOURCES.find(s => s.url === currentFilter)?.name ||
    Object.entries(COUNTRY_NAMES).find(([code]) => code.toLowerCase() === currentFilter.toLowerCase())?.[1] ||
    currentFilter === 'all' ? 'All Channels' : 'Select Source';

  const select = (filter: string) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all w-full"
      >
        <Radio className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="flex-1 text-left truncate text-xs">{currentName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {(['lang', 'country'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-sky-400 border-b-2 border-sky-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t === 'lang' ? 'Languages' : 'Countries'}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {tab === 'lang' && IPTV_SOURCES.map(s => (
              <button
                key={s.url}
                onClick={() => select(s.url)}
                className={`w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/3 ${currentFilter === s.url ? 'text-sky-400 bg-sky-500/10' : 'text-gray-300'}`}
              >
                <p className="text-xs font-medium">{s.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.description}</p>
              </button>
            ))}

            {tab === 'country' && Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <button
                key={code}
                onClick={() => select(code)}
                className={`w-full text-left px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/3 flex items-center gap-2 ${currentFilter === code ? 'text-sky-400 bg-sky-500/10' : 'text-gray-300'}`}
              >
                <span className="text-xs font-bold w-6">{code}</span>
                <span className="text-xs">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}