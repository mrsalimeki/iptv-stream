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
  '4K': 'bg-amber-500/80 text-white',
  '1080p': 'bg-cyan-500/80 text-white',
  '720p': 'bg-emerald-500/80 text-white',
  '480p': 'bg-slate-500/80 text-white',
  '360p': 'bg-slate-600/80 text-white',
  'HD': 'bg-cyan-600/80 text-white',
  'SD': 'bg-slate-600/80 text-white',
};

export default function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFavorite }: ChannelCardProps) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2 cursor-pointer rounded-xl transition-all duration-200 border ${
        isActive
          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : 'hover:bg-slate-800/60 border-slate-700/50 hover:border-cyan-500/30'
      }`}
      onClick={() => onSelect(channel)}
    >
      <div className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center transition-all border ${
        isActive ? 'bg-cyan-600/30 ring-2 ring-cyan-500/50 border-cyan-500/30' : 'bg-slate-800 border-slate-700'
      }`}>
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-1"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Tv2 className="w-6 h-6 text-slate-500" />
        )}
        {isActive && (
          <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight transition-colors ${
          isActive ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
        }`}>
          {channel.name}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{channel.category} {channel.country && `• ${channel.country}`}</p>
      </div>

      {channel.quality && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${QUALITY_COLORS[channel.quality] || 'bg-slate-700 text-slate-300'}`}>
          {channel.quality}
        </span>
      )}

      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite(channel); }}
        className={`transition-all duration-200 p-1.5 rounded-lg flex-shrink-0 ${
          isFavorite
            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
            : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-slate-700'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}