#!/bin/bash

# Seekr Backend Startup Script with PostgreSQL
# Usage: ./start-postgres.sh
# Configuration is read from ../. env file

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

# Set parent .env path
PARENT_ENV="../.env"

# Verify .env exists (it should be committed to repo)
if [ ! -f "$PARENT_ENV" ]; then
    echo -e "${RED}❌ Error: Shared .env file not found at $PARENT_ENV${NC}"
    echo -e "${RED}   The .env file should be committed to the repository.${NC}"
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' "$PARENT_ENV" | xargs)

# Validate required environment variables
if [ -z "$BACKEND_PORT" ]; then
    echo -e "${RED}❌ Error: BACKEND_PORT not found in .env${NC}"
    exit 1
fi

if [ -z "$DATABASE_PORT" ]; then
    echo -e "${RED}❌ Error: DATABASE_PORT not found in .env${NC}"
    exit 1
fi

if [ -z "$BACKEND_HOST" ]; then
    echo -e "${RED}❌ Error: BACKEND_HOST not found in .env${NC}"
    exit 1
fi

if [ -z "$DATABASE_NAME" ]; then
    echo -e "${RED}❌ Error: DATABASE_NAME not found in .env${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Seekr Backend with PostgreSQL on port ${BACKEND_PORT}...${NC}\n"

# Step 1: Check if Homebrew is installed
echo -e "${BLUE}Step 1/7: Checking Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${RED}❌ Error: Homebrew not found${NC}"
    echo -e "${YELLOW}Please install Homebrew from https://brew.sh${NC}"
    exit 1
fi
echo -e "${GREEN}Homebrew already installed${NC}"
echo -e "${BLUE}--------${NC}\n"

# Step 2: Check if PostgreSQL 18 is installed via Homebrew
echo -e "${BLUE}Step 2/7: Checking PostgreSQL 18...${NC}"
if ! brew list postgresql@18 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL 18 not found. Installing via Homebrew...${NC}"
    brew install postgresql@18
    echo -e "${GREEN}PostgreSQL 18 installed${NC}"
else
    echo -e "${GREEN}PostgreSQL 18 already installed${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Get PostgreSQL path from Homebrew
PGPATH=$(brew --prefix postgresql@18)

# Add PostgreSQL 18 to PATH for current session
export PATH="$PGPATH/bin:$PATH"

# Add to .zshrc if not already present
if [ -f ~/.zshrc ]; then
    if ! grep -q "postgresql@18/bin" ~/.zshrc; then
        echo -e "${YELLOW}⚠️  Adding PostgreSQL to ~/.zshrc...${NC}"
        echo "export PATH=\"$PGPATH/bin:\$PATH\"" >> ~/.zshrc
        echo -e "${GREEN}✅ PATH updated in ~/.zshrc${NC}"
    fi
fi

# Verify psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: PostgreSQL binaries not found in PATH${NC}"
    echo -e "${YELLOW}Try running: source ~/.zshrc${NC}"
    exit 1
fi

# Step 3: Check if PostgreSQL service is running
echo -e "${BLUE}Step 3/7: Starting PostgreSQL 18...${NC}"
if ! brew services list | grep postgresql@18 | grep started > /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL 18 not running. Starting via Homebrew services...${NC}"
    brew services start postgresql@18
    sleep 3

    # Verify it started
    if ! brew services list | grep postgresql@18 | grep started > /dev/null; then
        echo -e "${RED}❌ Error: Failed to start PostgreSQL 18${NC}"
        echo -e "${YELLOW}Check logs with: brew services list${NC}"
        exit 1
    fi

    echo -e "${GREEN}PostgreSQL 18 started${NC}"
else
    echo -e "${GREEN}PostgreSQL 18 already started${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Step 4: Create database if it doesn't exist
echo -e "${BLUE}Step 4/7: Checking ${DATABASE_NAME} database...${NC}"
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

# Step 5: Check if Python dependencies are installed
echo -e "${BLUE}Step 5/7: Checking Python dependencies...${NC}"
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    pip3 install -r requirements.txt
    echo -e "${GREEN}Dependencies installed${NC}"
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Step 6: Kill any process using the backend port
echo -e "${BLUE}Step 6/7: Checking port ${BACKEND_PORT}...${NC}"
if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Killing process on port ${BACKEND_PORT}...${NC}"
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}Port ${BACKEND_PORT} is now free${NC}"
else
    echo -e "${GREEN}Port ${BACKEND_PORT} is already free${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Step 7: Open database in TablePlus
echo -e "${BLUE}Step 7/7: Opening database in TablePlus...${NC}"
./open-db.sh "${DATABASE_URL}"

# Start the server
echo -e "\n${GREEN}🎯 Starting FastAPI server on http://localhost:${BACKEND_PORT}${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:${BACKEND_PORT}/docs${NC}\n"

python3 main.py
