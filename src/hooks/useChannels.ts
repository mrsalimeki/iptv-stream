import { useState, useEffect, useCallback, useRef } from 'react';
import type { Channel } from '../types/iptv';
import { fetchM3U, invalidateCache } from '../lib/iptvSources';

interface UseChannelsResult {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

const AUTO_REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

export function useChannels(filter: string): UseChannelsResult {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    if (!filter) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (forceRefresh) invalidateCache();

    setLoading(true);
    setError(null);

    try {
      const data = await fetchM3U(filter, controller.signal);
      setChannels(data);
      setLastUpdated(new Date());
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message || 'Failed to load channels');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();

    timerRef.current = setInterval(() => {
      load(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { channels, loading, error, refresh, lastUpdated };
}