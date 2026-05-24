import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, Settings, RefreshCw, Monitor, Smartphone,
  AlertCircle, Loader2
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

  const initPlayer = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);

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
        video.play().catch(() => setError('Autoplay blocked — click play'));
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('Stream error. Try refreshing.');
            setIsLoading(false);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => setError('Autoplay blocked — click play'));
    } else {
      video.src = url;
      video.play().catch(() => setError('Autoplay blocked — click play'));
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

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => { setError('Playback error'); setIsLoading(false); };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
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
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
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
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const toggleOrientation = () => setIsLandscape(p => !p);

  const handleRetry = () => {
    if (!channel) return;
    setRetryCount(p => p + 1);
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
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-gray-500 select-none">
        <Monitor className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium opacity-40">Select a channel to start watching</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${isLandscape ? 'aspect-video' : 'aspect-[9/16] max-h-screen'} w-full`}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />

      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-white text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry {retryCount > 0 && `(${retryCount})`}
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-8 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            {channel.logo && (
              <img src={channel.logo} alt="" className="h-8 w-8 rounded object-contain bg-white/10" />
            )}
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{channel.name}</p>
              <p className="text-gray-400 text-xs">{channel.category} {channel.country && `· ${channel.country}`}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-4 pb-3 pt-8 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-sky-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Volume */}
            <button onClick={toggleMute} className="text-white hover:text-sky-400 transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => changeVolume(Number(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer"
            />

            <div className="flex-1" />

            {/* Retry */}
            <button onClick={handleRetry} className="text-white/70 hover:text-white transition-colors" title="Retry">
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Orientation */}
            <button
              onClick={toggleOrientation}
              className="text-white/70 hover:text-white transition-colors"
              title={isLandscape ? 'Switch to portrait' : 'Switch to landscape'}
            >
              {isLandscape ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>

            {/* Quality */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(p => !p)}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{quality}</span>
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-8 right-0 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-10">
                  {QUALITIES.map(q => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-800 ${quality === q ? 'text-sky-400' : 'text-white'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}