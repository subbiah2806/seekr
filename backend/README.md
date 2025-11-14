# Seekr Backend

Simple Resume Management API built with Python, FastAPI, and PostgreSQL.

## Port Allocation

- **Seekr Web**: `4001`
- **Seekr Extension**: `4002`
- **Seekr Desktop**: `4003`
- **Seekr Mobile**: `4004`
- **Backend API**: `5000`
- **PostgreSQL Database**: `5432`

_All ports are configured in the Makefile at the repository root_

## Quick Start (One Command!)

Just like the frontend, start with one simple command:

```bash
npm start
# or
npm run dev
```

That's it! The script will:

- ✅ Check and install dependencies if needed
- ✅ Use SQLite (no database server needed!)
- ✅ Create tables automatically
- ✅ Start the server at http://localhost:5000

## Alternative: PostgreSQL Setup

If you want to use PostgreSQL instead of SQLite:

```bash
npm run start:postgres
```

This will:

- ✅ Install PostgreSQL (if not installed)
- ✅ Start PostgreSQL service
- ✅ Create database automatically
- ✅ Start the server

## Manual Setup (Advanced)

If you prefer manual control:

1. Install Python dependencies:

```bash
pip3 install -r requirements.txt
```

2. The `.env` file is already configured with SQLite by default.
   For PostgreSQL, edit `.env` and uncomment the PostgreSQL line.

3. Run the server:

```bash
python3 main.py
```

The server will start at `http://localhost:5000`

## Database Options

### SQLite (Default - Recommended for Development)

- **No server needed** - Just works!
- **File-based** - Database stored in `seekr.db`
- **Perfect for local development and testing**

### PostgreSQL (Optional - For Production)

- **Scalable** - Better for production
- **Server-based** - Runs on port 4201
- **Use `npm run start:postgres`** to auto-setup

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite / PostgreSQL** - Database options
- **Pydantic** - Data validation

## API Endpoints

### Health Check

```
GET /
GET /health
Response: { "status": "ok", "message": "Seekr API is running" }
```

### Resume Management

#### Create a Resume

```
POST /api/resumes
Body: {
  "company_name": "Google",
  "position_name": "Software Engineer",
  "resume_json": { ... }
}
Response: 201 Created
```

#### Get All Resumes (with pagination and filtering)

```
GET /api/resumes?page=1&page_size=10&company_name=fidelity

# Keyword search examples:
# company_name=fidelity  -> matches "Fidelity Investments"
# company_name=delity    -> matches "Fidelity Investments"
# company_name=GOOGLE    -> matches "Google" and "Google LLC" (case-insensitive)
# company_name=micro     -> matches "Microsoft" and "Microsoft Corporation"

Response: {
  "page": 1,
  "page_size": 10,
  "resumes": [...]
}

Note: Total count is not returned to avoid expensive count queries.
      Only fetches data for the requested page.
```

#### Get Single Resume

```
GET /api/resumes/{id}
Response: { "id": 1, "company_name": "Google", ... }
```

#### Update Resume

```
PUT /api/resumes/{id}
Body: {
  "position_name": "Senior Software Engineer"  # Only update specific fields
}
Response: Updated resume object
```

#### Delete Resume

```
DELETE /api/resumes/{id}
Response: 204 No Content
```

## Database Schema

### Resumes Table

- `id` - Integer (Primary Key, Auto-increment)
- `company_name` - String(255) (Indexed, Required)
- `position_name` - String(255) (Indexed, Required)
- `resume_json` - JSON (Required)
- `created_at` - DateTime (Auto-generated)
- `updated_at` - DateTime (Auto-updated)
- **Unique Constraint**: (`company_name`, `position_name`) - Same company + position combination cannot exist twice

## Features

- ✅ Full CRUD operations for resumes
- ✅ Pagination support
- ✅ Keyword search by company name (case-insensitive, partial match)
- ✅ Composite unique constraint (company_name + position_name)
- ✅ Automatic timestamps
- ✅ Error handling with proper HTTP status codes
- ✅ CORS enabled for frontend integration

## Interactive API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc
