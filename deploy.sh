#!/bin/bash
# Deployment script for ShokhDentist

set -e

echo "════════════════════════════════════════════════════════════"
echo "   🚀 ShokhDentist Deployment Script"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  IMPORTANT: Edit .env file and set your credentials!${NC}"
    echo ""
    exit 1
fi

# Source .env
set -a
source .env
set +a

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

echo ""

# Check credentials
if [ "$ADMIN_PASSWORD" = "change_this_secure_password_min_16_chars" ]; then
    echo -e "${RED}✗ Please set ADMIN_PASSWORD in .env file${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Admin password configured${NC}"

if [ "$BOT_TOKEN" = "your_telegram_bot_token_here" ]; then
    echo -e "${YELLOW}⚠️  BOT_TOKEN not set - dev mode will be used${NC}"
else
    echo -e "${GREEN}✓ Telegram bot token configured${NC}"
fi

echo ""
echo "Building and starting containers..."
echo ""

# Build and start
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check backend health
echo -n "Checking backend... "
if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
    echo "Check logs: docker-compose logs backend"
    exit 1
fi

# Check frontend health
echo -n "Checking frontend... "
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
    echo "Check logs: docker-compose logs frontend"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Deployment Successful!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Services are running:"
echo "  • Backend:  http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • Frontend: http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  • View logs:    docker-compose logs -f"
echo "  • Stop all:     docker-compose down"
echo "  • Restart:      docker-compose restart"
echo "  • Backend logs: docker-compose logs -f backend"
echo "  • Frontend logs: docker-compose logs -f frontend"
echo ""
echo "Health checks:"
echo "  • Backend:  curl http://localhost:8000/api/health"
echo "  • Frontend: curl http://localhost:3000/health"
echo ""
echo "════════════════════════════════════════════════════════════"
