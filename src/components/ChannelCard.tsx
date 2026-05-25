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
  '4K': 'bg-amber-500 text-white',
  '1080p': 'bg-blue-600 text-white',
  '720p': 'bg-emerald-600 text-white',
  '480p': 'bg-slate-500 text-white',
  '360p': 'bg-slate-400 text-white',
  'HD': 'bg-blue-500 text-white',
  'SD': 'bg-slate-500 text-white',
};

export default function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFavorite }: ChannelCardProps) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl transition-all duration-200 border-2 ${
        isActive
          ? 'bg-blue-50 border-blue-400 shadow-md'
          : 'hover:bg-slate-100 border-slate-200 hover:border-blue-300'
      }`}
      onClick={() => onSelect(channel)}
    >
      <div className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center transition-all border ${
        isActive ? 'bg-blue-200 ring-2 ring-blue-400 border-blue-300' : 'bg-slate-100 border-slate-300'
      }`}>
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-1"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Tv2 className="w-5 h-5 text-slate-400" />
        )}
        {isActive && (
          <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight transition-colors ${
          isActive ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'
        }`}>
          {channel.name}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{channel.category} {channel.country && `• ${channel.country}`}</p>
      </div>

      {channel.quality && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${QUALITY_COLORS[channel.quality] || 'bg-slate-400 text-white'}`}>
          {channel.quality}
        </span>
      )}

      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite(channel); }}
        className={`transition-all duration-200 p-1.5 rounded-lg flex-shrink-0 ${
          isFavorite
            ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-slate-200'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}