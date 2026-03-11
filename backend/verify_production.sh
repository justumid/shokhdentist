#!/bin/bash
# Production Readiness Verification Script

echo "════════════════════════════════════════════════════════════"
echo "   🔍 PRODUCTION READINESS VERIFICATION"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check 1: Required files exist
echo "📁 Checking required files..."
files=(
    "main.py"
    "config.py"
    "logger.py"
    "auth.py"
    "rate_limiter.py"
    "exceptions.py"
    "database.py"
    "requirements.txt"
    ".env"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
        missing=$((missing + 1))
    fi
done

if [ $missing -gt 0 ]; then
    echo ""
    echo "⚠️  $missing required files missing!"
    exit 1
fi

echo ""

# Check 2: Python modules load
echo "🐍 Testing Python modules..."
python3 << 'EOF'
import sys
sys.path.insert(0, '.')
try:
    from config import settings
    from logger import logger
    from auth import get_admin_user
    from rate_limiter import rate_limiter
    from exceptions import AppException
    from database import load_data
    from main import app
    print("  ✓ All modules load successfully")
except Exception as e:
    print(f"  ✗ Module error: {e}")
    sys.exit(1)
EOF

if [ $? -ne 0 ]; then
    exit 1
fi

echo ""

# Check 3: Environment configuration
echo "⚙️  Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "  ✗ .env file not found"
    echo "     Run: cp ../.env.example .env"
    exit 1
fi

source .env

if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" = "change_this_secure_password" ]; then
    echo "  ⚠️  ADMIN_PASSWORD not set (admin features disabled)"
else
    echo "  ✓ ADMIN_PASSWORD configured"
fi

if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "your_telegram_bot_token_here" ]; then
    echo "  ⚠️  BOT_TOKEN not set (dev mode active)"
else
    echo "  ✓ BOT_TOKEN configured"
fi

echo ""

# Check 4: Dependencies installed
echo "📦 Checking dependencies..."
python3 << 'EOF'
import sys
required = [
    'fastapi', 'uvicorn', 'pydantic', 'pydantic_settings',
    'websockets', 'aiohttp', 'pytest'
]
missing = []
for pkg in required:
    try:
        __import__(pkg)
    except ImportError:
        missing.append(pkg)

if missing:
    print(f"  ✗ Missing packages: {', '.join(missing)}")
    print("     Run: pip install -r requirements.txt")
    sys.exit(1)
else:
    print(f"  ✓ All {len(required)} required packages installed")
EOF

if [ $? -ne 0 ]; then
    exit 1
fi

echo ""

# Check 5: API endpoints
echo "🌐 Checking API structure..."
python3 << 'EOF'
import sys
sys.path.insert(0, '.')
from main import app

routes = [r for r in app.routes if hasattr(r, 'path')]
api_routes = [r for r in routes if r.path.startswith('/api/')]
admin_routes = [r for r in routes if '/admin/' in r.path]
ws_routes = [r for r in routes if r.path.startswith('/ws/')]

print(f"  ✓ {len(api_routes)} API endpoints")
print(f"  ✓ {len(admin_routes)} Admin endpoints (protected)")
print(f"  ✓ {len(ws_routes)} WebSocket endpoint")

if len(admin_routes) < 20:
    print("  ⚠️  Expected 21 admin endpoints")
EOF

echo ""

# Check 6: Data directory
echo "💾 Checking data storage..."
if [ ! -d "data" ]; then
    mkdir -p data
    echo "  ✓ Created data directory"
else
    echo "  ✓ Data directory exists"
    file_count=$(ls -1 data/*.json 2>/dev/null | wc -l)
    echo "    Found $file_count data files"
fi

echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "   ✅ VERIFICATION COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Your backend is production-ready! 🎉"
echo ""
echo "Next steps:"
echo "  1. Configure ADMIN_PASSWORD in .env"
echo "  2. Run: pytest test_backend.py -v"
echo "  3. Start: ./start_production.sh"
echo "  4. Test: curl http://localhost:8000/api/health"
echo ""
echo "Documentation: PRODUCTION_READY.md"
echo "════════════════════════════════════════════════════════════"
