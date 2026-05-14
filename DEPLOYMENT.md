# Deployment Guide — Railway.app

## Overview

This guide covers deploying Pharmavig MVP to [Railway.app](https://railway.app), a modern hosting platform similar to Heroku.

## Prerequisites

- GitHub account with the private repository
- Railway.app account (https://railway.app)
- PostgreSQL and Redis services on Railway

## Step-by-Step Deployment

### 1. Create a Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `pharmavig-mvp` repository
4. Choose the `main` branch for auto-deployment

### 2. Add Services (PostgreSQL + Redis)

1. **Add PostgreSQL**
   - Click "Add" → "PostgreSQL"
   - Railway auto-creates `DATABASE_URL` environment variable
   - Note the connection details for backups/debugging

2. **Add Redis** (optional for Phase 2 Celery)
   - Click "Add" → "Redis"
   - Railway auto-creates `REDIS_URL` environment variable

### 3. Configure Environment Variables

Go to **Settings** → **Variables** and add:

```
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
SECRET_KEY=<generate-strong-value>
AERZTEBLATT_BASE_URL=https://www.aerzteblatt.de
SCRAPER_TIMEOUT=30
SCRAPER_RATE_LIMIT=2.0
SPACY_MODEL=en_core_web_sm
USE_GPT4_FALLBACK=False
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**To generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Configure Dockerfile Build

Railway auto-detects `railway.json` in your repo:
- **Build Context**: `backend/`
- **Dockerfile**: Uses `backend/Dockerfile`
- **Start Command**: Defined in `railway.json`

### 5. Deploy

1. Push to `main` branch:
   ```bash
   git push origin main
   ```

2. Railway auto-triggers a build and deploy
3. Monitor progress in Railway UI → **Deployments** tab
4. Wait for "Success" status

### 6. Verify Deployment

```bash
# Get your app URL from Railway UI (Settings → Domain)
curl https://your-app.up.railway.app/health

# Expected response:
# {"status":"ok","version":"1.0.0","database":"ok"}
```

## Post-Deployment

### View Logs

In Railway UI:
- Click your service
- Go to **Logs** tab
- See real-time application output and migration logs

### View Database

```bash
# Get database credentials from Railway UI (PostgreSQL → Connect)
psql postgresql://user:password@host:5432/dbname

# Check tables
\dt

# Exit
\q
```

### Health Checks

- Railway monitors `/health` endpoint (defined in railway.json)
- If health check fails, your service auto-restarts
- Check logs if health check fails repeatedly

## Troubleshooting

### Deployment Fails

1. **Check logs in Railway UI** for error messages
2. **Common issues**:
   - Database migrations failed → check `alembic upgrade head` logs
   - Missing environment variables → verify `SECRET_KEY`, etc.
   - Dockerfile context wrong → ensure `railway.json` exists at repo root

### App Crashes After Deploy

Check Railway logs:
```
ERROR: Could not connect to database
```

Solutions:
- Wait 30-60 seconds for PostgreSQL service to be ready
- Verify `DATABASE_URL` is set correctly
- Manually trigger deployment again

### Database Connection Timeout

- Increase Railway PostgreSQL tier if under heavy load
- Check `SCRAPER_TIMEOUT` isn't too aggressive

## Rollback

If a deployment breaks production:

1. Go to Railway UI → **Deployments** tab
2. Find the last stable deployment
3. Click "Rollback" button
4. Select previous version and confirm

This reverts to the previous commit instantly.

## Scaling

### Increase Resources

1. Railway UI → Your service → **Settings**
2. Under "Scaling", increase:
   - **RAM**: For memory-heavy NLP operations
   - **vCPU**: For concurrent requests
3. Changes take effect on next deploy/restart

### Monitor Performance

In Railway UI:
- **Metrics** tab shows CPU, memory, network usage
- **Request metrics** show response times (Phase 2 feature)

## CI/CD Integration

Currently, Railway auto-deploys on any push to `main`.

To add GitHub Actions CI/CD (Phase 2):
1. Create `.github/workflows/ci.yml`
2. Add test step that runs `pytest backend/tests/`
3. Only deploy if tests pass

Example workflow:
```yaml
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/
      - run: railway deploy  # Only if tests pass
```

## Backup & Disaster Recovery

### Backup Database

```bash
# From local machine
pg_dump postgresql://user:password@railway-host:5432/dbname > backup.sql

# Restore
psql postgresql://user:password@railway-host:5432/dbname < backup.sql
```

Railway also provides **automated daily backups** (check their documentation).

## Monitoring & Alerts (Phase 2)

Consider setting up:
- **Sentry.io** for error tracking
- **DataDog/New Relic** for APM
- **PagerDuty** for incident alerting

Add to `backend/main.py`:
```python
import sentry_sdk
sentry_sdk.init("your-sentry-dsn")
```

## Support

- **Railway Docs**: https://docs.railway.app
- **GitHub Issues**: Link to your repo issues
- **Email**: your-support@example.com

---

**Happy deploying!** 🚀
