# Seekr Browser Extension

AI-powered Chrome extension for automated resume tailoring. Extract job postings, generate tailored resumes, and download in PDF or DOCX format.

## Features

- Extract job posting text from any webpage
- Send to FastAPI backend for AI-powered resume tailoring
- Download tailored resume in PDF or DOCX format
- Clean, professional UI with @subbiah/reusable component library
- Manifest V3 compliant

## Prerequisites

- Node.js 18+
- Chrome browser
- FastAPI backend running at `http://localhost:8000`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Development

```bash
npm run dev  # Build in watch mode
```

The extension will rebuild automatically when you make changes. Reload the extension in Chrome to see updates.

## Usage

1. Navigate to a job posting page (LinkedIn, Indeed, etc.)
2. Click the Seekr extension icon
3. Click "Tailor Resume for This Job"
4. Wait for AI processing
5. Download your tailored resume in PDF or DOCX format

## Architecture

### Directory Structure

```
extension/
├── src/
│   ├── popup/              # Popup UI components
│   │   ├── index.tsx       # React entry point
│   │   ├── Popup.tsx       # Main popup component
│   │   └── popup.html      # HTML template
│   ├── content/            # Content scripts
│   │   └── content.ts      # Page text extraction
│   ├── components/         # Reusable components
│   │   └── DownloadButtons.tsx
│   ├── utils/              # Utility functions
│   │   └── api.ts          # API client
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   └── styles.css          # Global styles
├── manifest.json           # Extension manifest
├── vite.config.ts          # Build configuration
└── tsconfig.json           # TypeScript config
```

### Components

- **Popup.tsx**: Main UI with state management for extraction, tailoring, and download
- **DownloadButtons.tsx**: PDF/DOCX generation and download
- **content.ts**: Extracts page text via `document.body.innerText`
- **api.ts**: HTTP client for backend communication

### API Integration

Backend endpoint: `POST http://localhost:8000/api/tailor-resume`

Request:

```json
{
  "requirement": "job posting text..."
}
```

Response:

```json
{
  "company_name": "Company Name",
  "position": "Position Title",
  "resume_json": { ... }
}
```

## Scripts

- `npm run dev` - Build in watch mode
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Tech Stack

- Chrome Extension Manifest V3
- React 19.0.0
- TypeScript 5.3.3
- Vite 5.0.8
- Tailwind CSS 3.4.3
- @subbiah/reusable component library
- lucide-react icons

## Error Handling

- Network errors: Shows user-friendly error message
- API errors: Displays backend error details
- Empty pages: Warns if no text found
- Missing fields: Validates API response structure

## Permissions

- `activeTab`: Access current page content
- `scripting`: Inject content scripts
- `http://localhost:8000/*`: API communication

## Troubleshooting

**Extension not loading:**

- Ensure `dist` folder exists (run `npm run build`)
- Check Chrome DevTools for errors
- Verify manifest.json is in dist folder

**API errors:**

- Ensure backend is running at `http://localhost:8000`
- Check CORS configuration
- Verify API endpoint structure

**Content script not working:**

- Refresh the page after loading extension
- Check content script is listed in manifest
- Verify content.js exists in dist folder

**Build errors:**

- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all peer dependencies are installed
