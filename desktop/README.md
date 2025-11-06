# Seekr Desktop Application

Electron-based desktop application for Seekr career management.

## Setup

```bash
npm install
npm run electron:dev
```

## Scripts

- `npm run electron:dev` - Start development server with Electron
- `npm run build` - Build desktop application
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

- Electron 33.2.0
- React 19.2.0
- TypeScript 5.4.5
- Vite 5.2.11
- Tailwind CSS 3.4.3
- @subbiah/reusable component library

## Architecture

The desktop app uses Electron to wrap the React web application, providing:

- Native desktop integration
- Background mode capability
- Multi-display support for interview assistance
- System tray integration (future)
