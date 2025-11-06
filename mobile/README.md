# Seekr Mobile Application

Cross-platform mobile app built with React and Capacitor.

## Setup

```bash
npm install
npm run build
npm run cap:init
npm run cap:add:ios    # For iOS development
npm run cap:add:android # For Android development
```

## Development

### Web Development

```bash
npm run dev  # Run on localhost:5175
```

### iOS Development

```bash
npm run build
npm run cap:sync
npm run cap:open:ios
```

### Android Development

```bash
npm run build
npm run cap:sync
npm run cap:open:android
```

## Scripts

- `npm run dev` - Start development server on port 5175
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking
- `npm run cap:sync` - Sync web app to native projects
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:open:android` - Open Android project in Android Studio

## Tech Stack

- Capacitor 6.2.0 (for native iOS/Android wrapping)
- React 19.2.0
- TypeScript 5.4.5
- Vite 5.2.11
- Tailwind CSS 3.4.3
- @subbiah/reusable component library

## Why Capacitor?

Capacitor was chosen over Ionic for:

- Lighter weight and better performance
- Full access to native APIs
- Better React integration
- Easier plugin system
- More flexible architecture
- Uses web components directly (no framework lock-in)

## Platform Support

- iOS (requires Xcode and macOS)
- Android (requires Android Studio)
- Progressive Web App (runs in browser)
