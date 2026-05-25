import { Heart, Tv2, Play } from 'lucide-react';
import type { Channel } from '../types/iptv';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
}

const QUALITY_COLORS: Record<string, string> = {
  '4K': 'bg-amber-500 text-white shadow-amber-500/30',
  '1080p': 'bg-cyan-500 text-white shadow-cyan-500/30',
  '720p': 'bg-emerald-500 text-white shadow-emerald-500/30',
  '480p': 'bg-slate-500 text-white',
  '360p': 'bg-slate-600 text-white',
  'HD': 'bg-cyan-600 text-white shadow-cyan-500/30',
  'SD': 'bg-slate-600 text-white',
};

export default function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFavorite }: ChannelCardProps) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-cyan-600/15 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-700'
      }`}
      onClick={() => onSelect(channel)}
    >
      <div className={`relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center transition-all ${
        isActive ? 'bg-cyan-600/30 ring-2 ring-cyan-500/50' : 'bg-slate-800'
      }`}>
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-1"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Tv2 className="w-5 h-5 text-slate-500" />
        )}
        {isActive && (
          <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight transition-colors ${
          isActive ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
        }`}>
          {channel.name}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{channel.category}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {channel.quality && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${QUALITY_COLORS[channel.quality] || 'bg-slate-700 text-slate-300'}`}>
            {channel.quality}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(channel); }}
          className={`transition-all duration-200 p-1.5 rounded-lg ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
              : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-slate-700'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}