# 🐳 Docker Deployment Guide

Complete guide for deploying ShokhDentist with Docker.

---

## 🚀 Quick Start

### 1. Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- 2GB RAM minimum
- 10GB disk space

### 2. Setup

```bash
# Clone or navigate to project
cd dental-booking

# Copy environment template
cp .env.example .env

# Edit .env and set your credentials
nano .env
```

**Required changes in `.env`:**
```bash
ADMIN_PASSWORD=your_secure_password_here_min_16_chars
BOT_TOKEN=your_telegram_bot_token_from_botfather
```

### 3. Deploy

```bash
# Build and start all services
./deploy.sh

# Or manually:
docker-compose up -d --build
```

### 4. Verify

```bash
# Run comprehensive tests
./test-docker-deployment.sh

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 📦 Services

### Backend (Port 8000)
- **Container**: `shokhdentist-backend`
- **Image**: Built from `./backend/Dockerfile`
- **Health Check**: `/api/health`
- **API Docs**: http://localhost:8000/docs
- **Volumes**: 
  - `backend-data:/app/data` (persistent storage)
  - `backend-logs:/app/logs` (log files)

### Frontend (Port 3000)
- **Container**: `shokhdentist-frontend`
- **Image**: Built from `./frontend/Dockerfile`
- **Health Check**: `/health`
- **URL**: http://localhost:3000
- **Tech**: React + Vite + Nginx

### Optional: PostgreSQL (Port 5432)
Uncomment in `docker-compose.yml` to enable:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ...
```

---

## 🔧 Configuration

### Environment Variables

**Backend:**
```bash
BOT_TOKEN                 # Telegram bot token
ADMIN_USERNAME            # Admin username (default: admin)
ADMIN_PASSWORD            # Admin password (REQUIRED)
ADMIN_SECRET_KEY          # JWT secret key (min 32 chars)
DEBUG                     # Debug mode (true/false)
LOG_LEVEL                 # INFO, DEBUG, WARNING, ERROR
LOG_FORMAT                # json or text
USE_DATABASE              # Enable PostgreSQL (true/false)
DATABASE_URL              # PostgreSQL connection string
RATE_LIMIT_ENABLED        # Enable rate limiting (true/false)
RATE_LIMIT_REQUESTS       # Requests per window (default: 100)
RATE_LIMIT_WINDOW         # Window in seconds (default: 60)
```

**Frontend:**
```bash
VITE_API_URL             # Backend API URL
VITE_WS_URL              # WebSocket URL
VITE_USE_BACKEND         # Use backend API (true/false)
VITE_DEV_MODE            # Development mode (true/false)
```

### Ports

Default ports:
- **Backend**: 8000
- **Frontend**: 3000
- **PostgreSQL**: 5432 (if enabled)

To change, edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8080:8000"  # Change 8080 to your port
```

---

## 🧪 Testing

### Automated Tests

```bash
# Full integration test
./test-docker-deployment.sh

# Expected output:
# ✅ ALL TESTS PASSED!
# Total Tests: 25
# Passed: 25
# Failed: 0
```

### Manual Tests

**Backend Health:**
```bash
curl http://localhost:8000/api/health
# {"status":"healthy","version":"1.0.0"}
```

**Frontend Health:**
```bash
curl http://localhost:3000/health
# healthy
```

**Test Patient State:**
```bash
curl -X POST http://localhost:8000/api/patient/state \
  -H "Content-Type: application/json" \
  -H "X-Dev-User-Id: 12345" \
  -d '{"fullName":"Test","phone":"+998901234567"}'
```

**Test Admin Auth:**
```bash
curl -u admin:your_password http://localhost:8000/api/admin/appointments
```

**WebSocket Test:**
```bash
# Install wscat: npm install -g wscat
wscat -c ws://localhost:8000/ws/slots/2026-04-01
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Container Status

```bash
# List all containers
docker-compose ps

# Detailed info
docker-compose ps --all

# Resource usage
docker stats
```

### Health Checks

Docker automatically monitors health:
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' shokhdentist-backend
docker inspect --format='{{.State.Health.Status}}' shokhdentist-frontend
```

---

## 🔄 Common Operations

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Update Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### View Container Shell

```bash
# Backend
docker-compose exec backend /bin/sh

# Frontend
docker-compose exec frontend /bin/sh
```

### Reset Everything

```bash
# Stop and remove all
docker-compose down -v

# Remove all data (WARNING: destructive)
docker volume rm dental-booking_backend-data
docker volume rm dental-booking_backend-logs

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

---

## 💾 Data Persistence

### Volumes

Data is persisted in Docker volumes:
- `backend-data`: Patient states, appointments, reviews
- `backend-logs`: Application logs
- `postgres-data`: Database files (if PostgreSQL enabled)

### Backup

```bash
# Backup all data
docker run --rm -v dental-booking_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backend-data-backup.tar.gz -C /data .

# Restore
docker run --rm -v dental-booking_backend-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/backend-data-backup.tar.gz"
```

### Export Data

```bash
# Copy data directory from container
docker cp shokhdentist-backend:/app/data ./backup-data

# Copy to container
docker cp ./backup-data shokhdentist-backend:/app/data
```

---

## 🚀 Production Deployment

### Using Docker on VPS

**1. Setup Server:**
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repository
git clone https://github.com/yourusername/dental-booking.git
cd dental-booking
```

**2. Configure:**
```bash
cp .env.example .env
nano .env
# Set production values
```

**3. Deploy:**
```bash
./deploy.sh
```

**4. Setup Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.shokhdentist.uz;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name shokhdentist.uz;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

**5. Enable SSL:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.shokhdentist.uz -d shokhdentist.uz
```

### Using Docker Swarm

**1. Initialize Swarm:**
```bash
docker swarm init
```

**2. Deploy Stack:**
```bash
docker stack deploy -c docker-compose.yml shokhdentist
```

**3. Scale Services:**
```bash
docker service scale shokhdentist_backend=3
docker service scale shokhdentist_frontend=2
```

### Using Kubernetes

See `k8s/` directory for Kubernetes manifests (if available).

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port 8000 already in use
# - Invalid credentials in .env
# - Permission issues with volumes

# Solutions:
# Change port in docker-compose.yml
# Verify .env file
# Fix permissions: sudo chown -R $USER:$USER .
```

### Frontend Not Building

```bash
# Check build logs
docker-compose logs frontend

# Common issues:
# - Node out of memory
# - Missing dependencies

# Solutions:
# Increase Docker memory (Docker Desktop settings)
# Build locally first: cd frontend && npm install && npm run build
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose logs postgres

# Test connection
docker-compose exec backend python3 -c "from database import db; print(db.test_connection())"
```

### WebSocket Not Working

```bash
# Verify WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:8000/ws/slots/2026-04-01

# Check nginx config for WebSocket support
```

---

## 📈 Performance Tuning

### Backend

**Increase Workers:**
Edit `main.py`:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        workers=4  # Add this
    )
```

**Enable Database:**
```bash
# In .env
USE_DATABASE=true
DATABASE_URL=postgresql://user:pass@postgres:5432/shokhdentist
```

### Frontend

**Optimize Build:**
```dockerfile
# In frontend/Dockerfile, add:
RUN npm run build -- --mode production
```

**Enable Caching:**
Nginx already configured with caching headers.

---

## 🔒 Security Best Practices

1. **Change Default Credentials:**
   ```bash
   ADMIN_PASSWORD=<strong-random-password>
   ADMIN_SECRET_KEY=<32-char-random-string>
   ```

2. **Use HTTPS in Production:**
   - Enable SSL with Let's Encrypt
   - Set `WEB_APP_URL=https://...`

3. **Restrict Network Access:**
   ```yaml
   # In docker-compose.yml
   services:
     backend:
       networks:
         - internal
   ```

4. **Enable Rate Limiting:**
   ```bash
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_REQUESTS=100
   ```

5. **Regular Updates:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📞 Quick Commands Reference

```bash
# Deploy
./deploy.sh

# Test
./test-docker-deployment.sh

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Update
git pull && docker-compose up -d --build

# Backup
docker cp shokhdentist-backend:/app/data ./backup

# Shell
docker-compose exec backend /bin/sh
```

---

## ✅ Deployment Checklist

- [ ] Docker & Docker Compose installed
- [ ] `.env` file configured
- [ ] `ADMIN_PASSWORD` changed
- [ ] `BOT_TOKEN` set
- [ ] Firewall rules configured
- [ ] SSL certificate obtained (production)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Test deployment: `./test-docker-deployment.sh`
- [ ] Health checks passing
- [ ] WebSocket working
- [ ] Admin panel accessible

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ `./test-docker-deployment.sh` shows all tests passing  
✅ Backend health: `curl localhost:8000/api/health` returns `healthy`  
✅ Frontend loads: http://localhost:3000  
✅ Admin login works: http://localhost:8000/docs  
✅ WebSocket connects: Check browser console  
✅ Data persists after restart  

---

_Last Updated: 2026-03-11_  
_Docker Version: Tested with Docker 24.0+_  
_Status: ✅ Production Ready_
