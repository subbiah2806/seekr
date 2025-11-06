# Seekr - Your Personal Career Autopilot

**Seekr** is an intelligent, multi-platform career management system that automates your job search, prepares you for interviews, and keeps you organized throughout your professional journey.

_Seekr: Because your career deserves a personal assistant._

## 🚀 Quick Start

### Installation

```bash
# Install all dependencies for all packages
npm run install:all
```

### Development

Run individual applications:

```bash
# Web application (port 5173)
npm run dev:web

# Desktop application (Electron)
npm run dev:desktop

# Mobile application (port 5175)
npm run dev:mobile

# Browser extension (build in watch mode)
npm run dev:extension

# Backend server (port 3000)
npm run dev:backend
```

### Building

```bash
# Build all applications
npm run build:all

# Or build individually
npm run build:web
npm run build:desktop
npm run build:mobile
npm run build:extension
npm run build:backend
```

## 📦 Project Structure

```
seekr/
├── web/              # React web application (Vite + React)
├── desktop/          # Electron desktop application
├── mobile/           # Mobile app (React + Capacitor)
├── extension/        # Chrome browser extension
├── backend/          # Node.js backend with WebSocket support
├── IDEA.md           # Full project vision and roadmap
└── package.json      # Root package with workspace scripts
```

## 🛠 Tech Stack

### Frontend (All Platforms)

- **React**: 19.2.0
- **TypeScript**: 5.4.5
- **Tailwind CSS**: 3.4.3
- **@subbiah/reusable**: Shared component library

### Platform-Specific

- **Web**: Vite 5.2.11
- **Desktop**: Electron 33.2.0
- **Mobile**: Capacitor 6.2.0
- **Extension**: Chrome Manifest V3
- **Backend**: Express 5.0.1 + Socket.IO 4.8.1

## 📱 Platforms

### 1. Web Application

- **Port**: 5173
- **Tech**: Vite + React
- **Features**: Full-featured web interface
- **README**: [web/README.md](web/README.md)

### 2. Desktop Application

- **Port**: 5174
- **Tech**: Electron wrapping React app
- **Features**: Native desktop integration, background mode
- **README**: [desktop/README.md](desktop/README.md)

### 3. Mobile Application

- **Port**: 5175
- **Tech**: React + Capacitor
- **Platforms**: iOS, Android
- **README**: [mobile/README.md](mobile/README.md)

### 4. Browser Extension

- **Tech**: Chrome Extension (Manifest V3)
- **Features**: Resume tailoring, job page scraping
- **README**: [extension/README.md](extension/README.md)

### 5. Backend Service

- **Port**: 3000
- **Tech**: Express + Socket.IO
- **Features**: WebSocket server, REST API, automation
- **README**: [backend/README.md](backend/README.md)

## 🎯 Current Status: MVP

All applications currently display "Hello World" and are ready for feature development.

### MVP Completed ✅

- [x] Project structure setup
- [x] All 5 applications scaffolded
- [x] Component library integration
- [x] Configuration files (Vite, TypeScript, Tailwind)
- [x] "Hello World" on all platforms
- [x] Development scripts

### Next Steps 🚧

- [ ] Install dependencies for all packages
- [ ] Test each application
- [ ] Implement core features from [IDEA.md](IDEA.md)
- [ ] WebSocket integration
- [ ] Database setup

## 🧪 Testing

```bash
# Type check all packages
npm run type-check:all
```

## 📖 Documentation

- **Full Vision**: [IDEA.md](IDEA.md) - Complete feature roadmap and architecture
- **Web App**: [web/README.md](web/README.md)
- **Desktop App**: [desktop/README.md](desktop/README.md)
- **Mobile App**: [mobile/README.md](mobile/README.md)
- **Extension**: [extension/README.md](extension/README.md)
- **Backend**: [backend/README.md](backend/README.md)

## 🌟 Core Features (Planned)

1. **Job Application Intelligence**
   - Gmail integration for tracking applications
   - LinkedIn auto-apply
   - Status tracking dashboard

2. **Smart Resume Tailoring**
   - Browser extension for one-click customization
   - AI-powered resume generation
   - ATS optimization

3. **Interview Preparation**
   - Tailored resume analysis
   - Smart study guides
   - Personalized learning paths

4. **Interview Support Tools**
   - Desktop background mode
   - Real-time coding challenge assistance
   - Multi-display support

5. **Unified Notification System**
   - WebSocket-based real-time updates
   - Cross-platform notifications
   - Custom automation scripts

## 🚀 Deployment Options

### Option 1: Self-Hosted (Free)

- Clone the repository
- Run backend locally
- Complete data privacy and control
- Zero subscription cost

### Option 2: Premium Hosted Service (Future)

- Managed infrastructure
- No technical setup required
- Automatic updates

## 📝 License

MIT

## 👨‍💻 Author

Subbiah

---

**Ready to automate your career? Let's build Seekr! 🎯**
