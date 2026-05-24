import { Heart, Tv2, Signal } from 'lucide-react';
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
  '1080p': 'bg-sky-500 text-white',
  '720p': 'bg-emerald-500 text-white',
  '480p': 'bg-gray-500 text-white',
  '360p': 'bg-gray-600 text-white',
  'HD': 'bg-sky-600 text-white',
  'SD': 'bg-gray-600 text-white',
};

export default function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFavorite }: ChannelCardProps) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl transition-all duration-150 ${
        isActive
          ? 'bg-sky-600/20 border border-sky-500/40'
          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
      }`}
      onClick={() => onSelect(channel)}
    >
      {/* Logo / placeholder */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-0.5"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Tv2 className="w-5 h-5 text-gray-500" />
        )}
        {isActive && (
          <div className="absolute inset-0 bg-sky-500/10 flex items-center justify-center">
            <Signal className="w-3 h-3 text-sky-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${isActive ? 'text-sky-300' : 'text-gray-200'}`}>
          {channel.name}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{channel.category}</p>
      </div>

      {/* Quality badge + favorite */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {channel.quality && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${QUALITY_COLORS[channel.quality] || 'bg-gray-700 text-gray-300'}`}>
            {channel.quality}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(channel); }}
          className={`opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded-full hover:bg-white/10 ${isFavorite ? '!opacity-100 text-red-400' : 'text-gray-500 hover:text-red-400'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}