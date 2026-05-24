export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  country: string;
  language: string;
  category: string;
  quality?: string;
  backup_urls?: string[];
}

export interface M3USource {
  name: string;
  url: string;
  description: string;
}

export type Quality = 'auto' | '1080p' | '720p' | '480p' | '360p';
export type Orientation = 'landscape' | 'portrait';

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  quality: Quality;
  orientation: Orientation;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}