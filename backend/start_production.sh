#!/bin/bash
# Production startup script with health checks and logging

set -e

echo "🚀 Starting ShokhDentist Backend..."

# Check Python version
python_version=$(python3 --version)
echo "✓ Python: $python_version"

# Check environment
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env with your credentials"
    exit 1
fi

# Load environment
export $(grep -v '^#' .env | xargs)

# Validate required variables
if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "your_telegram_bot_token_here" ]; then
    echo "⚠️  BOT_TOKEN not configured in .env"
    echo "   Bot will run in development mode"
fi

if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" = "change_this_secure_password" ]; then
    echo "⚠️  ADMIN_PASSWORD not set! Admin panel will be disabled."
    echo "   Set a secure password in .env"
fi

# Create data directory
mkdir -p data
echo "✓ Data directory ready"

# Check dependencies
echo "📦 Checking dependencies..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Dependencies not installed. Installing..."
    pip3 install -r requirements.txt
fi

echo "✓ Dependencies OK"

# Start backend
echo "🌐 Starting FastAPI server on port ${PORT:-8000}..."
echo "📚 API docs: http://localhost:${PORT:-8000}/docs"
echo "🏥 Health check: http://localhost:${PORT:-8000}/api/health"
echo ""

python3 main.py
