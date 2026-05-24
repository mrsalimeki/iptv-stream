import { useState, useEffect, useCallback } from 'react';
import type { Channel } from '../types/iptv';

const STORAGE_KEY = 'iptv_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Channel[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
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

  return { favorites, isFavorite, toggleFavorite };
}