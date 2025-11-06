# Seekr - Your Personal Career Autopilot

**Seekr** is an intelligent, multi-platform career management system that automates your job search, prepares you for interviews, and keeps you organized throughout your professional journey.

## Core Concept

A unified platform that can be either:

- **Premium Hosted Service** - Users pay for a hosted solution
- **Self-Hosted (Free)** - Users clone the repo and run everything locally with their own backend

All applications (web, desktop, mobile, browser extension) connect to a single backend via WebSocket for real-time communication and automation.

## Features & Modules

### 1. Job Application Intelligence

**Gmail Integration & Tracking**

- User provides Gmail credentials on first login
- Scrapes emails to identify job applications
- Automatically categorizes applications into columns:
  - Jobs Applied
  - Jobs Rejected
  - Needs Attention
  - Awaiting Response
  - Interview In Progress
- Each entry includes:
  - Company name
  - Position
  - Application date
  - Status
  - Email links to related correspondence
  - Auto-updated status based on email content

**LinkedIn Auto-Apply**

- Daily LinkedIn monitoring for relevant job postings
- Cross-references with existing applications from Gmail scraper
- Auto-applies to jobs not yet applied
- Adds newly applied jobs to tracking dashboard
- Updates status when response emails arrive

### 2. Smart Resume Tailoring

**Browser Extension**

- One-click resume customization
- Analyzes job description text content from current page
- Generates tailored resume matching job requirements
- **Current**: Downloads customized resume file
- **Future**: Auto-uploads file to job application form

**Workflow**:

1. User browses job posting
2. Clicks extension button
3. Extension scrapes page content
4. Sends to backend for AI processing
5. Returns tailored resume
6. Downloads file (future: auto-uploads)

### 3. Interview Preparation System

**Tailored Resume Tracker**

- Maintains all versions of tailored resumes
- Identifies skills/technologies claimed in each resume
- Cross-references with user's actual expertise

**Smart Study Guide**

- Dedicated "Learning" page in web app
- Shows all tailored resumes
- User selects which resume to prepare for
- System analyzes gaps between claimed skills and actual knowledge

**Personalized Learning Paths**

- First-time setup asks user preferences:
  - Preferred programming language for examples
  - Learning style preferences
  - Reference frameworks (e.g., "Explain in Java terms")
- Saves preferences for future use
- Generates custom courses focused only on knowledge gaps
- Adapts explanations to user's preferred language/framework

**Interview Reminders**

- Tracks upcoming interviews
- Sends reminders days before interview
- Prompts user to study tailored resume content
- Links directly to personalized learning materials

### 4. Interview Support Tools

**Desktop Application (Electron)**

- Background mode - invisible during video calls
- Receives coding challenges from browser extension
- Displays answers/hints on secondary screen not shared on Zoom
- Acts as silent assistant during technical interviews

**Browser Extension Integration**

- Command+Q hotkey during interview
- Captures coding challenge from page
- Sends to backend → desktop app
- Desktop app shows solution on background display

### 5. Unified Notification & Automation System

**WebSocket Architecture**

- Single backend serves all platforms
- Persistent WebSocket connections to:
  - Web application
  - Desktop application
  - Mobile application (iOS/Android)
  - Browser extension
- Real-time bidirectional communication

**Extensible Backend**

- Users can write custom scripts
- Backend executes automation tasks
- Sends notifications to all connected clients
- Examples:
  - Stock price alerts
  - Custom reminders
  - Application status changes
  - Interview reminders
  - Any user-defined automation

**Cross-Platform Notifications**

- Job application updates
- Interview reminders
- Stock alerts
- Custom user-defined notifications
- Synchronized across all devices

### 6. Mobile Application (React Native)

**Features**:

- Receives real-time notifications from backend
- View job application dashboard
- Quick resume tailoring
- Interview preparation on-the-go
- Custom notification management
- iOS and Android support

## Technical Architecture

### Monorepo Structure

```
seekr/
├── packages/
│   ├── web/              # Web application
│   ├── desktop/          # Electron desktop app
│   ├── mobile/           # React Native mobile app
│   ├── extension/        # Browser extension (Chrome)
│   ├── backend/          # Unified backend service
│   └── shared/           # Shared types, utilities
```

### Backend Services

- Gmail API integration
- LinkedIn scraping service
- Resume generation AI service
- Job matching algorithm
- WebSocket server
- User authentication
- Database (job tracking, resumes, user preferences)
- Custom script execution engine

### Communication Flow

```
All Clients (Web/Desktop/Mobile/Extension)
          ↓↑ WebSocket
    Unified Backend
          ↓↑
  External Services (Gmail, LinkedIn, AI)
```

## Deployment Options

### Option 1: Premium Hosted Service

- Seekr hosts backend infrastructure
- Users subscribe and use immediately
- No technical setup required
- Managed updates and maintenance

### Option 2: Self-Hosted (Free)

- User clones GitHub repository
- Runs backend on local machine
- All applications point to local backend
- Complete data privacy and control
- Zero subscription cost
- User manages own updates

## Future Expansion Ideas

Beyond career management, Seekr can evolve into a complete personal assistant:

- Financial tracking and alerts
- Health and fitness reminders
- Personal task management
- Smart home integration
- Calendar and schedule optimization
- Any user-defined automation via backend scripts

## Tagline

_Seekr: Because your career deserves a personal assistant._

---

## Development Phases

### Phase 1: MVP (Core Job Tracking)

- Gmail integration and scraping
- Basic job application dashboard
- Simple status tracking

### Phase 2: Resume Tailoring

- Browser extension development
- AI resume generation
- Download functionality

### Phase 3: Auto-Apply

- LinkedIn integration
- Auto-apply logic
- Duplicate detection

### Phase 4: Interview Prep

- Tailored resume analysis
- Learning path generation
- Study reminders

### Phase 5: Interview Support

- Desktop background app
- Real-time coding challenge assistance
- Multi-display support

### Phase 6: Mobile & Full Platform

- React Native mobile app
- Complete WebSocket integration
- Cross-platform notifications

### Phase 7: Extensibility

- Custom script engine
- User-defined automations
- Plugin system
