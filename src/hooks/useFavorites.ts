import { useState, useEffect, useCallback } from 'react';
import type { Channel } from '../types/iptv';

const STORAGE_KEY = 'iptv_favorites_v2';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Channel[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (channelId: string) => favorites.some(c => c.id === channelId),
    [favorites]
  );

  const toggleFavorite = useCallback((channel: Channel) => {
    setFavorites(prev =>
      prev.some(c => c.id === channel.id)
        ? prev.filter(c => c.id !== channel.id)
        : [...prev, channel]
    );
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { favorites, isFavorite, toggleFavorite, clearAllFavorites };
}