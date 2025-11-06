#!/bin/bash

# Open Seekr Database in TablePlus
# Usage: ./open-db.sh <database_url>
# Example: ./open-db.sh "postgresql://user@localhost:5432/db_name"

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}--------${NC}\n"

# Check if database URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Database URL argument required${NC}"
    echo -e "${YELLOW}Usage: $0 <database_url>${NC}"
    echo -e "${YELLOW}Example: $0 \"postgresql://user@localhost:5432/db_name\"${NC}"
    exit 1
fi

# Get database URL from argument
DB_URL_INPUT="$1"

# Convert postgresql+psycopg:// to postgresql://
DB_URL=$(echo "$DB_URL_INPUT" | sed 's/postgresql+psycopg:/postgresql:/')

echo -e "${BLUE}🗄️  Opening Seekr DB in TablePlus...${NC}\n"

# Step 1: Check if TablePlus is installed
echo -e "${BLUE}Step 1/2: Checking TablePlus...${NC}"
if open -Ra TablePlus 2>/dev/null; then
    echo -e "${GREEN}TablePlus already installed${NC}"
else
    echo -e "${YELLOW}⚠️  TablePlus not found. Installing via Homebrew...${NC}"

    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Error: Homebrew not found${NC}"
        echo -e "${YELLOW}Please install Homebrew from https://brew.sh${NC}"
        exit 1
    fi

    brew install --cask tableplus
    echo -e "${GREEN}TablePlus installed${NC}"
fi
echo -e "${BLUE}--------${NC}\n"

# Step 2: Open TablePlus with connection
echo -e "${BLUE}Step 2/2: Opening database connection...${NC}"

# Try opening TablePlus with the URL
if open -a TablePlus "$DB_URL" 2>/dev/null; then
    echo -e "${GREEN}Database URL: ${DB_URL} opened in TablePlus${NC}"
else
    # Fallback: just open TablePlus
    echo -e "${YELLOW}⚠️  Opening TablePlus app...${NC}"
    echo -e "${YELLOW}Please manually connect using: ${DB_URL}${NC}"
    open -a TablePlus
fi
echo -e "${BLUE}--------${NC}\n"
