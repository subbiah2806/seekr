# Seekr - Complete Setup Guide

AI-powered resume tailoring with FastAPI backend + Chrome extension

## ⚠️ WHAT YOU NEED TO DO

### 1. Create PostgreSQL Database
```bash
createdb seekr
```

### 2. Start Backend
```bash
cd modules/seekr/backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env: Add DATABASE_URL and ANTHROPIC_API_KEY
python init_db.py
python main.py
```

Backend will run at: http://localhost:8000

### 3. Load Chrome Extension  
Extension is already built at: `modules/seekr/extension/dist/`

**Load in Chrome**:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" 
3. Click "Load unpacked"
4. Select: `modules/seekr/extension/dist/`

---

## Complete Documentation

### Backend (FastAPI + PostgreSQL)

#### Setup
```bash
cd modules/seekr/backend
pip install -r requirements.txt
```

#### Configure
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/seekr
ANTHROPIC_API_KEY=your_key_here
```

**Note**: The `postgresql+psycopg://` prefix is required for psycopg3 driver.

#### Initialize Database
```bash
python init_db.py
```

This will:
- Create `tailored_resume` table
- Seed base resume from `resume-builder/actual/resume.json`

#### Start Server
```bash
python main.py
```

API docs: http://localhost:8000/docs

### Chrome Extension (React + Vite)

#### Already Built!
Extension is built and ready at: `modules/seekr/extension/dist/`

#### Load in Chrome
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle top-right)
3. Click "Load unpacked"
4. Select folder: `modules/seekr/extension/dist/`

#### Rebuild if needed
```bash
cd modules/seekr/extension
npm install
npm run build
```

---

## Usage

1. Navigate to a job posting page
2. Click Seekr extension icon
3. Click "Tailor Resume for This Job"
4. Wait for AI processing
5. Download PDF or DOCX

---

## Troubleshooting

**Backend error: "Base resume not found"**
```bash
python init_db.py
```

**Extension won't load**
```bash
cd modules/seekr/extension
npm run build
```

**Database connection error**
```bash
createdb seekr
# Update DATABASE_URL in .env
```
