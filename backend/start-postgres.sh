#!/bin/bash

# Seekr Backend Startup Script with PostgreSQL
# Usage: ./start-postgres.sh
# Configuration is passed via environment variables from Makefile

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Validate required environment variables
if [ -z "$BACKEND_PORT" ]; then
    echo -e "${RED}❌ Error: BACKEND_PORT environment variable not set${NC}"
    echo -e "${RED}   This should be passed from Makefile${NC}"
    exit 1
fi

if [ -z "$DATABASE_PORT" ]; then
    echo -e "${RED}❌ Error: DATABASE_PORT environment variable not set${NC}"
    echo -e "${RED}   This should be passed from Makefile${NC}"
    exit 1
fi

if [ -z "$BACKEND_HOST" ]; then
    echo -e "${RED}❌ Error: BACKEND_HOST environment variable not set${NC}"
    echo -e "${RED}   This should be passed from Makefile${NC}"
    exit 1
fi

if [ -z "$DATABASE_NAME" ]; then
    echo -e "${RED}❌ Error: DATABASE_NAME environment variable not set${NC}"
    echo -e "${RED}   This should be passed from Makefile${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable not set${NC}"
    echo -e "${RED}   This should be passed from Makefile${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Seekr Backend with PostgreSQL on port ${BACKEND_PORT}...${NC}\n"

# Step 1: Check if PostgreSQL is installed
echo -e "${BLUE}Step 1/5: Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: PostgreSQL not found${NC}"
    echo -e "${YELLOW}Please install PostgreSQL or use DevContainer${NC}"
    exit 1
fi
echo -e "${GREEN}PostgreSQL installed: $(psql --version)${NC}"
echo -e "${BLUE}--------${NC}\n"

# Step 2: Check if PostgreSQL service is running
echo -e "${BLUE}Step 2/5: Checking PostgreSQL service...${NC}"
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL not running. Attempting to start...${NC}"

    # Try different methods to start PostgreSQL
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        PGPATH=$(brew --prefix postgresql@18 2>/dev/null || brew --prefix postgresql 2>/dev/null)
        if [ -n "$PGPATH" ]; then
            export PATH="$PGPATH/bin:$PATH"
            brew services start postgresql@18 2>/dev/null || brew services start postgresql 2>/dev/null
        fi
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start postgresql 2>/dev/null || true
    elif command -v pg_ctl &> /dev/null; then
        # Direct pg_ctl start (DevContainer/Ubuntu)
        PGDATA="${PGDATA:-/var/lib/postgresql/data}"
        if [ ! -d "$PGDATA" ]; then
            # Initialize database if not exists
            mkdir -p "$PGDATA"
            pg_ctl init -D "$PGDATA" 2>/dev/null || true
        fi
        pg_ctl -D "$PGDATA" start -o "-p $DATABASE_PORT" 2>/dev/null || true
    fi

    sleep 3

    # Verify it started
    if ! pg_isready -q; then
        echo -e "${YELLOW}⚠️  PostgreSQL might not be running, but continuing anyway...${NC}"
        echo -e "${YELLOW}   If you see connection errors, manually start PostgreSQL${NC}"
    else
        echo -e "${GREEN}PostgreSQL started successfully${NC}"
    fi
else
    echo -e "${GREEN}PostgreSQL already running${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Step 3: Create database if it doesn't exist
echo -e "${BLUE}Step 3/5: Checking ${DATABASE_NAME} database...${NC}"
if ! psql -lqt | cut -d \| -f 1 | grep -qw $DATABASE_NAME; then
    echo -e "${YELLOW}⚠️  Creating database '$DATABASE_NAME'...${NC}"
    createdb $DATABASE_NAME
    echo -e "${GREEN}${DATABASE_NAME} created: ${DATABASE_URL}${NC}"
else
    echo -e "${GREEN}${DATABASE_NAME} already exists: ${DATABASE_URL}${NC}"
fi

# Export environment variables for Python
export DATABASE_URL
export BACKEND_HOST
export BACKEND_PORT
echo -e "${BLUE}--------${NC}\n"

# Start the server
echo -e "\n${GREEN}🎯 Starting FastAPI server on http://localhost:${BACKEND_PORT}${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:${BACKEND_PORT}/docs${NC}\n"

python3 main.py
