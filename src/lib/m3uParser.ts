import type { Channel } from '../types/iptv';

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function parseM3U(text: string): Channel[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  let currentMeta: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#EXTINF:')) {
      currentMeta = {};

      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/);
      const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);

      const nameFromEnd = line.split(',').pop()?.trim() || '';

      currentMeta.id = tvgIdMatch?.[1] || slugify(tvgNameMatch?.[1] || nameFromEnd) + '-' + Math.random().toString(36).slice(2, 7);
      currentMeta.name = tvgNameMatch?.[1] || nameFromEnd;
      currentMeta.logo = tvgLogoMatch?.[1] || '';
      currentMeta.country = tvgCountryMatch?.[1]?.toUpperCase() || '';
      currentMeta.language = tvgLanguageMatch?.[1] || '';
      currentMeta.category = groupTitleMatch?.[1] || 'General';
    } else if (!line.startsWith('#') && line.startsWith('http') && currentMeta.name) {
      channels.push({
        id: currentMeta.id || slugify(currentMeta.name!) + '-' + i,
        name: currentMeta.name!,
        logo: currentMeta.logo || '',
        url: line,
        country: currentMeta.country || '',
        language: currentMeta.language || '',
        category: currentMeta.category || 'General',
        quality: detectQuality(currentMeta.name!),
      });
      currentMeta = {};
    }
  }

  return channels;
}

function detectQuality(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('4K') || n.includes('UHD')) return '4K';
  if (n.includes('FHD') || n.includes('1080')) return '1080p';
  if (n.includes('HD') || n.includes('720')) return '720p';
  if (n.includes('SD') || n.includes('480')) return '480p';
  return 'HD';
}