import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, Settings, RefreshCw, Monitor, AlertCircle, Loader2
} from 'lucide-react';
import type { Channel, Quality } from '../types/iptv';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose?: () => void;
}

const QUALITIES: Quality[] = ['auto', '1080p', '720p', '480p', '360p'];

export default function VideoPlayer({ channel, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<Quality>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, []);

  const initPlayer = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);

    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setError('Stream taking too long. Click retry or select another channel.');
        setIsLoading(false);
      }
    }, 15000);

    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        levelLoadingMaxRetry: 6,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 6,
        startLevel: -1,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        video.play().catch(() => {
          setError('Click play to start');
          setIsLoading(false);
        });
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('Stream error. Try another channel.');
            setIsLoading(false);
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {
        setError('Click play to start');
        setIsLoading(false);
      });
    } else {
      video.src = url;
      video.play().catch(() => {
        setError('Click play to start');
        setIsLoading(false);
      });
    }
  }, [destroyHls]);

  useEffect(() => {
    if (!channel) return;
    setRetryCount(0);
    initPlayer(channel.url);

    return destroyHls;
  }, [channel, initPlayer, destroyHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
    const onError = () => {
      setError('Playback error. Try another channel.');
      setIsLoading(false);
    };
    const onCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const changeVolume = (v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const handleRetry = () => {
    if (!channel) return;
    setRetryCount(p => p + 1);
    setError(null);
    setIsLoading(true);
    initPlayer(channel.url);
  };

  const handleQualityChange = (q: Quality) => {
    setQuality(q);
    setShowQualityMenu(false);
    if (!hlsRef.current) return;
    if (q === 'auto') {
      hlsRef.current.currentLevel = -1;
    } else {
      const levels = hlsRef.current.levels;
      const heightMap: Record<string, number> = { '1080p': 1080, '720p': 720, '480p': 480, '360p': 360 };
      const target = heightMap[q];
      const idx = levels.findIndex(l => l.height <= target);
      if (idx >= 0) hlsRef.current.currentLevel = idx;
    }
  };

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 text-slate-400 select-none">
        <Monitor className="w-20 h-20 mb-4 opacity-30" />
        <p className="text-xl font-medium opacity-50">Select a channel to watch</p>
        <p className="text-sm text-slate-600 mt-2">Choose from the sidebar</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black overflow-hidden group w-full h-full aspect-video"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        autoPlay
        controls={false}
      />

      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
          <p className="text-white/80 text-sm">Loading stream...</p>
          <p className="text-white/50 text-xs mt-2">Click retry if taking too long</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
          <AlertCircle className="w-14 h-14 text-red-400" />
          <p className="text-white text-base font-medium text-center px-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Retry {retryCount > 0 && `(${retryCount})`}
            </button>
            <button
              onClick={() => setError(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Play className="w-4 h-4" />
              Play
            </button>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/50 px-3 py-2 rounded-xl backdrop-blur-sm">
            {channel.logo && (
              <img src={channel.logo} alt="" className="h-9 w-9 rounded-lg object-contain bg-white/10 p-1" />
            )}
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{channel.name}</p>
              <p className="text-slate-300 text-xs">{channel.category} {channel.country && `· ${channel.country}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <div className="flex items-center gap-1.5 bg-red-600/90 px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white w-9 h-9 flex items-center justify-center bg-black/50 rounded-lg hover:bg-black/70 transition-all"
              >
                X
              </button>
            )}
          </div>
        </div>

        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-cyan-600/90 hover:bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105"
            >
              <Play className="w-10 h-10 text-white ml-1" />
            </button>
          </div>
        )}

        <div className="px-4 pb-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-cyan-400 transition-colors bg-black/30 p-2 rounded-lg hover:bg-black/50"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-cyan-400 transition-colors bg-black/30 p-2 rounded-lg hover:bg-black/50"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => changeVolume(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />

            <div className="flex-1" />

            <button
              onClick={handleRetry}
              className="text-white/70 hover:text-white transition-colors bg-black/30 p-2 rounded-lg hover:bg-black/50"
              title="Retry stream"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(p => !p)}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium transition-colors bg-black/30 px-3 py-2 rounded-lg hover:bg-black/50"
              >
                <Settings className="w-4 h-4" />
                <span>{quality}</span>
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-12 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-10 min-w-[100px]">
                  {QUALITIES.map(q => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-cyan-600/20 ${quality === q ? 'text-cyan-400 bg-cyan-600/10' : 'text-white'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white/70 hover:text-white transition-colors bg-black/30 p-2 rounded-lg hover:bg-black/50"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}