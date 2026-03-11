# 🚀 Render.com Deployment - Complete Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [x] Backend fully functional
- [x] Frontend fully functional
- [x] All endpoints tested
- [x] Docker configuration ready
- [x] Environment variables documented
- [x] CORS configured for production
- [x] Rate limiting enabled
- [x] Error handling implemented
- [x] Logging configured
- [x] Health checks working

### ✅ Render Configuration Files
- [x] `render.yaml` - Blueprint configuration
- [x] `backend/render-build.sh` - Backend build script
- [x] `backend/render-start.sh` - Backend start script
- [x] `frontend/.env.production` - Frontend environment
- [x] `.github/workflows/keep-alive.yml` - Keep backend alive

---

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
cd /home/sardor/Desktop/dental-booking

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production-ready with Render deployment"

# Create GitHub repository and push
# Go to github.com and create new repository: dental-booking
git remote add origin https://github.com/YOUR_USERNAME/dental-booking.git
git branch -M main
git push -u origin main
```

### Step 2: Get Telegram Bot Token

If you don't have one:
```bash
# 1. Open Telegram
# 2. Search for @Botfather
# 3. Send /newbot
# 4. Follow instructions
# 5. Save the token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
```

### Step 3: Deploy to Render

#### Option A: Blueprint Deployment (Recommended - Automatic)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Sign up with GitHub

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select `dental-booking` repository
   - Render will detect `render.yaml` automatically

3. **Configure Blueprint**
   - Service group name: `shokhdentist`
   - Click "Apply"

4. **Set Environment Variables**
   
   In the backend service settings, add:
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_SECRET_KEY=your-very-long-secret-key-at-least-32-characters-long
   ```

5. **Deploy**
   - Render will automatically build and deploy both services
   - Wait 5-10 minutes for first deployment

#### Option B: Manual Deployment (More Control)

##### Backend Service:

1. **Create Backend Web Service**
   ```
   Dashboard → New → Web Service
   - Repository: dental-booking
   - Name: shokhdentist-backend
   - Region: Oregon (or closest to users)
   - Branch: main
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: ./render-build.sh
   - Start Command: ./render-start.sh
   - Plan: Free
   ```

2. **Environment Variables**
   ```
   PYTHON_VERSION=3.11.0
   BOT_TOKEN=<paste_your_bot_token>
   WEB_APP_URL=https://shokhdentist.vercel.app
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<strong_password>
   ADMIN_SECRET_KEY=<random_32_char_string>
   DEBUG=false
   LOG_LEVEL=INFO
   USE_DATABASE=false
   RATE_LIMIT_ENABLED=true
   HOST=0.0.0.0
   PORT=10000
   ```

3. **Advanced Settings**
   - Health Check Path: `/api/health`
   - Auto-Deploy: Yes

##### Frontend Service:

1. **Create Frontend Static Site**
   ```
   Dashboard → New → Static Site
   - Repository: dental-booking
   - Name: shokhdentist-frontend
   - Region: Oregon
   - Branch: main
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Publish Directory: dist
   - Plan: Free
   ```

2. **Environment Variables**
   ```
   NODE_VERSION=20.11.0
   VITE_API_URL=https://shokhdentist-backend.onrender.com
   VITE_WS_URL=shokhdentist-backend.onrender.com
   ```

3. **Redirect/Rewrite Rules**
   Add in "Redirects/Rewrites" section:
   ```
   /*  /index.html  200
   ```

### Step 4: Post-Deployment Configuration

#### 1. Update Telegram Bot Webhook

After backend deploys successfully:

```bash
# Replace YOUR_BOT_TOKEN and YOUR_BACKEND_URL
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://shokhdentist-backend.onrender.com/webhook"
  }'
```

Expected response:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

#### 2. Update Telegram Bot Menu Button

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "📅 Vaqt band qilish",
      "web_app": {
        "url": "https://shokhdentist-frontend.onrender.com"
      }
    }
  }'
```

#### 3. Verify Deployment

```bash
# Test backend health
curl https://shokhdentist-backend.onrender.com/api/health

# Expected: {"status":"healthy","timestamp":"..."}

# Test backend slots
curl https://shokhdentist-backend.onrender.com/api/slots

# Test frontend
curl https://shokhdentist-frontend.onrender.com

# Expected: HTML content
```

#### 4. Test Through Telegram

1. Open your bot in Telegram
2. Send `/start`
3. Click "📅 Vaqt band qilish" button
4. Mini app should open with your frontend
5. Test booking flow

### Step 5: Enable Keep-Alive (Optional)

To prevent free tier spin-down:

1. **Enable GitHub Actions**
   - Go to your repository settings
   - Actions → General → Allow all actions
   - Workflow permissions → Read and write

2. **Workflow will run automatically**
   - Pings backend every 14 minutes
   - Keeps service active 24/7

3. **Alternative: External Cron**
   - Use cron-job.org
   - Create job to ping: `https://shokhdentist-backend.onrender.com/api/health`
   - Schedule: Every 14 minutes

---

## 🔍 Verification & Testing

### Automated Testing

Run comprehensive endpoint tests:

```bash
# Test local backend first
python test_all_endpoints_comprehensive.py

# Test deployed backend
python test_all_endpoints_comprehensive.py https://shokhdentist-backend.onrender.com
```

### Manual Testing Checklist

- [ ] Health endpoint responds
- [ ] Slots API returns available times
- [ ] Can create booking
- [ ] Admin login works
- [ ] Admin panel shows bookings
- [ ] Can download questionnaire PDF
- [ ] Can update booking status
- [ ] Can cancel booking
- [ ] WebSocket connection works
- [ ] Frontend loads correctly
- [ ] Frontend connects to backend
- [ ] Telegram Mini App opens
- [ ] End-to-end booking flow works

---

## 📊 Monitoring & Maintenance

### Built-in Monitoring

**Render Dashboard provides:**
- Real-time logs
- CPU/Memory usage graphs
- Request metrics
- Deployment history
- Health check status

**Access logs:**
```
Dashboard → Service → Logs (top right)
```

### External Monitoring (Recommended)

1. **Uptime Robot** (Free)
   - Monitor: `https://shokhdentist-backend.onrender.com/api/health`
   - Alert if down for 5+ minutes
   - https://uptimerobot.com

2. **Better Stack** (Free tier)
   - Centralized logging
   - Error tracking
   - https://betterstack.com

3. **Sentry** (Free tier)
   - Error tracking
   - Performance monitoring
   - https://sentry.io

### Log Access

```bash
# View backend logs
# Dashboard → shokhdentist-backend → Logs

# Download logs
# Dashboard → shokhdentist-backend → Logs → Download
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Service won't start**
```bash
# Check logs in Render dashboard
# Common issues:
# 1. Missing environment variables
# 2. Build command failed
# 3. Port configuration wrong (must be 10000)

# Fix:
# - Verify all required env vars are set
# - Check build logs for errors
# - Ensure PORT=10000
```

**Problem: Health check failing**
```bash
# Test health endpoint manually
curl https://shokhdentist-backend.onrender.com/api/health

# If timeout, check:
# 1. Service is running (check dashboard)
# 2. PORT environment variable is 10000
# 3. HOST is 0.0.0.0
```

**Problem: Slow cold starts**
```bash
# This is normal for free tier
# First request after 15min inactivity takes ~30 seconds

# Solution:
# 1. Enable keep-alive workflow
# 2. Use cron job to ping every 14 minutes
# 3. Upgrade to paid plan ($7/month) for no spin-down
```

### Frontend Issues

**Problem: Frontend can't connect to backend**
```bash
# Check environment variables
# Dashboard → shokhdentist-frontend → Environment

# Verify:
VITE_API_URL=https://shokhdentist-backend.onrender.com
VITE_WS_URL=shokhdentist-backend.onrender.com

# If wrong, update and trigger redeploy:
# Dashboard → Manual Deploy → Clear build cache & deploy
```

**Problem: 404 on routes**
```bash
# Ensure redirect rule is set
# Dashboard → shokhdentist-frontend → Redirects/Rewrites

# Add:
/*  /index.html  200
```

### Database Issues

**Problem: Bookings not persisting**
```bash
# Currently using file storage
# Check backend logs for write errors

# For production, consider PostgreSQL:
# Dashboard → New → PostgreSQL
# Then update backend env: USE_DATABASE=true, DATABASE_URL=...
```

### Telegram Issues

**Problem: Webhook not receiving updates**
```bash
# Check webhook status
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"

# If not set, reset webhook:
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -d "url=https://shokhdentist-backend.onrender.com/webhook"
```

**Problem: Mini App won't open**
```bash
# Verify bot menu button
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getChatMenuButton"

# Reset if needed (see Step 4.2)
```

---

## 🔄 Updates & Deployments

### Automatic Deployment

Render auto-deploys on every push to main branch:

```bash
# Make changes
git add .
git commit -m "Update: ..."
git push origin main

# Render will automatically:
# 1. Pull changes
# 2. Build
# 3. Deploy
# 4. Run health checks
```

### Manual Deployment

In Render Dashboard:
```
Service → Manual Deploy → Deploy latest commit
```

### Rollback

```
Service → Events → Find previous deployment → Rollback
```

---

## 💰 Cost Management

### Free Tier Limits

**Per Account:**
- 750 hours/month (enough for 1 service 24/7)
- 100 GB bandwidth/month
- 15 minute spin-down on inactivity

**Tips to stay free:**
- Use keep-alive for backend only
- Frontend is static (no hours used)
- Monitor bandwidth usage

### When to Upgrade

Consider paid plan if:
- Need 24/7 uptime without spin-down
- Exceed 100 GB bandwidth
- Need faster build times
- Need more than 512 MB RAM
- Need background workers

**Starter Plan: $7/month**
- No spin-down
- 1 GB RAM
- Faster builds
- Priority support

---

## 🔐 Security Checklist

- [x] HTTPS enabled (automatic on Render)
- [x] Environment variables encrypted
- [x] Admin endpoints protected with JWT
- [x] Rate limiting enabled
- [x] CORS properly configured
- [x] No secrets in code
- [x] Strong admin password
- [x] Input validation on all endpoints
- [ ] Consider: Enable WAF (paid feature)
- [ ] Consider: IP whitelisting for admin (if static IP)

---

## 📈 Scaling Strategy

### Phase 1: Current (Free Tier)
- Single backend instance
- Static frontend
- File-based storage
- Good for: 100-500 bookings/month

### Phase 2: Light Traffic ($7-14/month)
- Upgrade backend to Starter
- Add PostgreSQL database
- Keep frontend static
- Good for: 1,000+ bookings/month

### Phase 3: Medium Traffic ($30-50/month)
- Multiple backend instances
- Redis for caching
- PostgreSQL for data
- CDN for assets
- Good for: 10,000+ bookings/month

### Phase 4: High Traffic ($100+/month)
- Load balancer
- Horizontal scaling
- Background workers
- Advanced monitoring
- Good for: 100,000+ bookings/month

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Render Status:** https://status.render.com
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

## ✅ Deployment Success Checklist

After deployment, verify:

- [ ] Backend health endpoint returns 200
- [ ] Backend slots endpoint returns data
- [ ] Frontend loads without errors
- [ ] Admin login works
- [ ] Can create test booking
- [ ] Booking appears in admin panel
- [ ] Can download questionnaire PDF
- [ ] Telegram webhook is set
- [ ] Telegram bot menu button opens app
- [ ] End-to-end booking flow works
- [ ] WebSocket connection establishes
- [ ] Keep-alive workflow is active
- [ ] Monitoring is set up

---

## 🎉 You're Live!

Your dental booking system is now deployed and accessible at:

- **Frontend:** https://shokhdentist-frontend.onrender.com
- **Backend:** https://shokhdentist-backend.onrender.com
- **Admin Panel:** https://shokhdentist-frontend.onrender.com/admin
- **Telegram Bot:** @YourBotUsername

Share your bot with users and start taking bookings! 🦷
