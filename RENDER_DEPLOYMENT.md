# Render.com Deployment Guide

## Why Render?

Render is the best free hosting option for this project because:

✅ **Free Tier Benefits:**
- 750 hours/month of free web service runtime (enough for 24/7)
- Automatic SSL certificates
- Custom domains support
- GitHub auto-deploy on push
- Built-in CDN for static sites
- WebSocket support
- Zero cold start for static sites

✅ **Perfect for Our Stack:**
- Native Python support (FastAPI backend)
- Static site hosting (Vite/React frontend)
- PostgreSQL database option (when needed)
- Environment variable management
- Health checks and monitoring

✅ **Better than Alternatives:**
- **vs Heroku**: Completely free, no credit card required
- **vs Vercel**: Better for WebSocket support, no serverless limitations
- **vs Railway**: More generous free tier
- **vs Netlify**: Better backend support with persistent WebSockets

## Deployment Options

### Option 1: Blueprint Deployment (Recommended)

This uses the `render.yaml` file for automated setup.

1. **Push to GitHub:**
   ```bash
   cd /home/sardor/Desktop/dental-booking
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/dental-booking.git
   git push -u origin main
   ```

2. **Connect to Render:**
   - Go to https://dashboard.render.com/
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables:**
   In the Render Dashboard, set these secret values:
   - `BOT_TOKEN`: Your Telegram bot token
   - `ADMIN_USERNAME`: Admin username
   - `ADMIN_PASSWORD`: Strong admin password
   - `ADMIN_SECRET_KEY`: Random 32+ character string

4. **Update Frontend URL:**
   After deployment, update `WEB_APP_URL` in backend environment to point to your frontend URL.

### Option 2: Manual Deployment

#### Backend Service:

1. **Create Web Service:**
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repo
   - Name: `shokhdentist-backend`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`

2. **Environment Variables:**
   ```
   PYTHON_VERSION=3.11.0
   BOT_TOKEN=<your_bot_token>
   WEB_APP_URL=https://shokhdentist.vercel.app
   ADMIN_USERNAME=<your_admin>
   ADMIN_PASSWORD=<your_password>
   ADMIN_SECRET_KEY=<32_char_secret>
   DEBUG=false
   LOG_LEVEL=INFO
   USE_DATABASE=false
   RATE_LIMIT_ENABLED=true
   HOST=0.0.0.0
   PORT=10000
   ```

3. **Health Check:** `/api/health`

#### Frontend Service:

1. **Create Static Site:**
   - Dashboard → "New" → "Static Site"
   - Connect GitHub repo
   - Name: `shokhdentist-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables:**
   ```
   NODE_VERSION=20.11.0
   VITE_API_URL=https://shokhdentist-backend.onrender.com
   VITE_WS_URL=shokhdentist-backend.onrender.com
   ```

3. **Redirect Rules:**
   Add in "Redirects/Rewrites":
   ```
   /*  /index.html  200
   ```

## Post-Deployment Configuration

### 1. Update Telegram Bot Webhook

After backend is deployed, update your bot webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://shokhdentist-backend.onrender.com/webhook"
  }'
```

### 2. Verify Deployment

Test all endpoints:
```bash
# Health check
curl https://shokhdentist-backend.onrender.com/api/health

# Get time slots
curl https://shokhdentist-backend.onrender.com/api/slots

# Frontend
curl https://shokhdentist-frontend.onrender.com
```

### 3. Configure Custom Domain (Optional)

1. Go to service settings in Render
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate will be auto-provisioned

## Important Notes

### Free Tier Limitations:

- **Backend spins down after 15 minutes of inactivity**
  - First request after sleep takes ~30 seconds
  - Subsequent requests are instant
  - Consider: Implement a cron job to ping every 14 minutes if 24/7 uptime needed

- **750 hours/month per service**
  - Enough for one service to run 24/7
  - Multiple services share this limit

- **Bandwidth: 100 GB/month per account**

### Keep Backend Alive (Optional):

Use cron-job.org or GitHub Actions to ping every 14 minutes:

```yaml
# .github/workflows/keep-alive.yml
name: Keep Render Alive
on:
  schedule:
    - cron: '*/14 * * * *'  # Every 14 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl https://shokhdentist-backend.onrender.com/api/health
```

## Environment Variables Reference

### Required:
- `BOT_TOKEN` - Telegram bot token from @BotFather
- `ADMIN_USERNAME` - Admin panel username
- `ADMIN_PASSWORD` - Admin panel password (use strong password)
- `ADMIN_SECRET_KEY` - Secret key for JWT tokens (min 32 chars)

### Optional:
- `WEB_APP_URL` - Frontend URL (default: https://shokhdentist.vercel.app)
- `DEBUG` - Debug mode (default: false)
- `LOG_LEVEL` - Logging level (default: INFO)
- `RATE_LIMIT_ENABLED` - Enable rate limiting (default: true)
- `RATE_LIMIT_REQUESTS` - Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW` - Window in seconds (default: 60)

## Monitoring

### Built-in Monitoring:
- Dashboard shows CPU, memory, bandwidth usage
- Request logs available in real-time
- Health check status visible
- Auto-restart on failures

### External Monitoring (Recommended):
- UptimeRobot: Free uptime monitoring
- Better Stack: Free log management
- Sentry: Free error tracking

## Troubleshooting

### Backend won't start:
1. Check logs in Render dashboard
2. Verify all required env vars are set
3. Ensure Python version is 3.11+
4. Check `requirements.txt` for missing dependencies

### Frontend shows API errors:
1. Verify `VITE_API_URL` points to correct backend URL
2. Check CORS settings in backend
3. Ensure backend is running and healthy
4. Check browser console for detailed errors

### WebSocket connection fails:
1. Ensure using `wss://` protocol (not `ws://`)
2. Check `VITE_WS_URL` has correct hostname (no protocol)
3. Verify backend WebSocket endpoint is accessible
4. Check firewall/proxy settings

## Scaling Options

When you outgrow the free tier:

1. **Upgrade to Starter ($7/month):**
   - No spin down
   - Faster instances
   - More bandwidth

2. **Add PostgreSQL ($7/month):**
   - Persistent database
   - Better performance
   - Data backups

3. **Add Redis ($10/month):**
   - Caching layer
   - Session storage
   - WebSocket scaling

## Security Checklist

- ✅ SSL/TLS enabled automatically
- ✅ Environment variables encrypted
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Admin endpoints protected
- ✅ Secrets not in code
- ✅ Security headers set
- ⚠️ Consider: WAF for production
- ⚠️ Consider: DDoS protection for high traffic

## Cost Comparison (Monthly)

```
Render (Free):
- Backend: $0
- Frontend: $0
- SSL: $0
- Total: $0/month ✅

Render (Paid):
- Backend: $7
- Frontend: $0
- Database: $7 (if needed)
- Total: $7-14/month

Heroku:
- Dyno: $7
- Database: $9
- Total: $16/month

Railway:
- $5 credit/month (runs out quickly)
- Then $0.20/hour = ~$144/month

DigitalOcean:
- Droplet: $6/month
- But requires manual setup & maintenance
```

## Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com
