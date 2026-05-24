import type { M3USource } from '../types/iptv';

// IPTV-Org API endpoints
const API_BASE = 'https://iptv-org.github.io/api';

export const IPTV_SOURCES: M3USource[] = [
  { name: 'All Channels', url: 'all', description: 'Complete channel database' },
  { name: 'Arabic Channels', url: 'ara', description: 'Arabic-language channels' },
  { name: 'English Channels', url: 'eng', description: 'English-language channels' },
  { name: 'French Channels', url: 'fra', description: 'French-language channels' },
  { name: 'Spanish Channels', url: 'spa', description: 'Spanish-language channels' },
  { name: 'German Channels', url: 'deu', description: 'German-language channels' },
  { name: 'Turkish Channels', url: 'tur', description: 'Turkish-language channels' },
  { name: 'Russian Channels', url: 'rus', description: 'Russian-language channels' },
  { name: 'Persian Channels', url: 'fas', description: 'Persian/Farsi channels' },
  { name: 'Hindi Channels', url: 'hin', description: 'Hindi-language channels' },
  { name: 'Urdu Channels', url: 'urd', description: 'Urdu-language channels' },
];

export const COUNTRY_SOURCES: Record<string, string> = {
  SA: 'SA', AE: 'AE', EG: 'EG', US: 'US', GB: 'GB',
  FR: 'FR', DE: 'DE', TR: 'TR', RU: 'RU', IR: 'IR',
  IN: 'IN', PK: 'PK', IT: 'IT', ES: 'ES', BR: 'BR',
  MA: 'MA', IQ: 'IQ', KW: 'KW', QA: 'QA', JO: 'JO',
  LB: 'LB', SY: 'SY', DZ: 'DZ', TN: 'TN', LY: 'LY',
  SD: 'SD', YE: 'YE', OM: 'OM', BH: 'BH',
};

export const COUNTRY_NAMES: Record<string, string> = {
  SA: 'Saudi Arabia', AE: 'UAE', EG: 'Egypt', US: 'USA', GB: 'UK',
  FR: 'France', DE: 'Germany', TR: 'Turkey', RU: 'Russia', IR: 'Iran',
  IN: 'India', PK: 'Pakistan', IT: 'Italy', ES: 'Spain', BR: 'Brazil',
  MA: 'Morocco', IQ: 'Iraq', KW: 'Kuwait', QA: 'Qatar', JO: 'Jordan',
  LB: 'Lebanon', SY: 'Syria', DZ: 'Algeria', TN: 'Tunisia', LY: 'Libya',
  SD: 'Sudan', YE: 'Yemen', OM: 'Oman', BH: 'Bahrain',
};

const CACHE_TTL = 6 * 60 * 60 * 1000;

let streamsCache: any[] | null = null;
let channelsCache: any[] | null = null;
let cacheTimestamp = 0;

// Normalize string for matching
function normalize(str: string): string {
  return (str || '').toLowerCase().trim();
}

// Detect quality from URL or quality field
function detectQuality(stream: any): string {
  if (stream.quality) return stream.quality;
  const url = stream.url?.toLowerCase() || '';
  if (url.includes('4k') || url.includes('uhd')) return '4K';
  if (url.includes('1080')) return '1080p';
  if (url.includes('720')) return '720p';
  if (url.includes('480')) return '480p';
  if (url.includes('360')) return '360p';
  return 'HD';
}

export async function fetchM3U(filter: string, signal?: AbortSignal): Promise<any[]> {
  const now = Date.now();

  // Load streams and channels from API
  if (!streamsCache || !channelsCache || now - cacheTimestamp > CACHE_TTL) {
    const [streamsRes, channelsRes] = await Promise.all([
      fetch(`${API_BASE}/streams.json`, { signal, cache: 'no-store' }),
      fetch(`${API_BASE}/channels.json`, { signal, cache: 'no-store' }),
    ]);

    if (!streamsRes.ok || !channelsRes.ok) {
      throw new Error('Failed to fetch channel data');
    }

    streamsCache = await streamsRes.json();
    channelsCache = await channelsRes.json();
    cacheTimestamp = now;
  }

  // Build channel map for metadata
  const channelMap = new Map<string, any>();
  for (const ch of channelsCache) {
    if (ch.id) channelMap.set(ch.id, ch);
  }

  const result: any[] = [];
  const added = new Set<string>();

  for (const stream of streamsCache) {
    // Skip duplicates
    if (added.has(stream.url)) continue;

    // Get channel metadata
    const chMeta = stream.channel ? channelMap.get(stream.channel) : null;

    // Apply filter
    const lang = normalize(chMeta?.languages?.[0] || '');
    const country = normalize(chMeta?.country || '');
    const filterNorm = normalize(filter);

    if (filter !== 'all' && filter) {
      const langMatch = lang === filterNorm || (lang && lang.includes(filterNorm));
      const countryMatch = country === filterNorm;

      // Also check if language name contains filter
      const langNames: Record<string, string[]> = {
        'ara': ['arabic', 'عربي', 'عربية'],
        'eng': ['english', 'الإنجليزية'],
        'fra': ['french', 'فرنسي'],
        'spa': ['spanish', 'إسباني'],
        'deu': ['german', 'ألماني'],
        'tur': ['turkish', 'تركي', 'türkçe'],
        'rus': ['russian', 'روسي'],
        'fas': ['persian', 'فارسي', 'farsi'],
        'hin': ['hindi', 'هندي'],
        'urd': ['urdu', 'أردو'],
      };

      const aliases = langNames[filterNorm] || [filterNorm];
      const aliasMatch = aliases.some(a => lang.includes(a) || normalize(chMeta?.languages?.join(' ')).includes(a));

      if (!langMatch && !countryMatch && !aliasMatch) continue;
    }

    const title = stream.title || chMeta?.name || 'Unknown';
    const id = `ch-${stream.channel || ''}-${stream.url.slice(-12).replace(/[^a-z0-9]/gi, '')}`;

    result.push({
      id,
      name: title,
      logo: chMeta?.logo || '',
      url: stream.url,
      country: chMeta?.country || '',
      language: chMeta?.languages?.[0] || '',
      category: chMeta?.categories?.[0] || 'General',
      quality: detectQuality(stream),
    });

    added.add(stream.url);
  }

  return result;
}

export function invalidateCache() {
  streamsCache = null;
  channelsCache = null;
  cacheTimestamp = 0;
}