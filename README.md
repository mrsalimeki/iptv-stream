# IPTV Stream Player

Watch live TV channels from around the world - Arabic, English, Turkish, Persian, and 100+ languages.

## Features

- 10,000+ live TV channels
- Filter by language or country
- HLS streaming support
- Quality selection (4K, 1080p, 720p, 480p)
- Favorites system (localStorage)
- Responsive design
- Dark theme
- Android APK support

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build Android APK
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Usage

1. Select a language or country from the dropdown
2. Wait for channels to load
3. Click a channel to watch
4. Use filters to search or filter by category
5. Add channels to favorites with the heart icon

## Tech Stack

- React + TypeScript
- Tailwind CSS
- HLS.js for video streaming
- Capacitor for Android
- Supabase (optional for cloud sync)
- IPTV-Org API for channel data

## Download APK

Download the latest APK from [GitHub Actions](https://github.com/mrsalimeki/iptv-stream/actions).

## License

MIT