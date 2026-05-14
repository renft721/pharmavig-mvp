# Pharmacovigilance AI Agent — MVP

An AI-powered system for automated drug safety information extraction from scientific literature.

## Project Structure

```
pharmavig-mvp/
├── backend/                  # FastAPI backend
│   ├── main.py              # App entry point
│   ├── config.py            # Settings
│   ├── database.py          # SQLAlchemy models
│   ├── scrapers.py          # Web scrapers
│   ├── nlp.py               # NLP extraction pipeline
│   ├── routes/              # API route handlers
│   │   ├── drugs.py
│   │   ├── findings.py
│   │   ├── searches.py
│   │   └── audit_logs.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/                # React frontend (to be created)
├── docker-compose.yml       # Local dev setup
└── README.md

```

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Python 3.11+ (if running locally without Docker)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Option 1: Run with Docker Compose (Recommended for MVP)

```bash
# Clone the repository
git clone <repo-url>
cd pharmavig-mvp

# Copy environment variables
cp .env.example .env

# Build and start all services
docker-compose up -d

# Wait for services to start (~30 seconds)
sleep 30

# Check API is running
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"1.0.0"}

# Check database schema is created
docker-compose exec postgres psql -U pharmavig -d pharmavig_mvp -c "\dt"
```

### Option 2: Run locally (for development)

```bash
# Create Python venv
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Set up .env file
cp .env.example .env
# Edit .env with your local DB connection string

# Create database (assuming PostgreSQL is running locally)
# psql -U postgres -c "CREATE DATABASE pharmavig_mvp"

# Run migrations (when alembic is set up)
# alembic upgrade head

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API will be available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

## API Endpoints (MVP)

### Drugs
- `POST /api/v1/drugs` — Create a new drug
- `GET /api/v1/drugs` — List all drugs
- `GET /api/v1/drugs/{drug_id}` — Get drug + findings count
- `GET /api/v1/drugs/search/{drug_name}` — Search drugs by name
- `DELETE /api/v1/drugs/{drug_id}` — Delete a drug

### Findings
- `POST /api/v1/findings` — Create a finding
- `GET /api/v1/findings/pending` — Get findings pending QPPV review (Approval Queue)
- `GET /api/v1/findings/{finding_id}` — Get finding details + comments
- `POST /api/v1/findings/{finding_id}/approve` — QPPV approves finding
- `POST /api/v1/findings/{finding_id}/reject` — QPPV rejects finding
- `POST /api/v1/findings/{finding_id}/comment` — Add comment to finding

### Audit Logs
- `GET /api/v1/audit-logs` — Get audit trail (paginated, read-only)
- `GET /api/v1/audit-logs/{record_id}` — Get audit trail for specific record

### Searches (TODO in Phase 2)
- `POST /api/v1/searches/{drug_id}/trigger` — Trigger immediate search
- `POST /api/v1/searches/{drug_id}/schedule` — Schedule periodic searches

## MVP Features

### ✅ Implemented
- [x] FastAPI backend with CORS middleware
- [x] PostgreSQL database schema with audit trail
- [x] Basic web scraper (Aerzteblatt, generic web)
- [x] NLP pipeline (entity extraction, conflict detection)
- [x] CRUD API for drugs and findings
- [x] Approval workflow (QPPV review before save)
- [x] Audit logging (GVP Module VI compliance ready)
- [x] Docker Compose setup for local dev

### 🚧 In Progress
- [ ] React frontend (search, results, approval dashboard)
- [ ] Celery background jobs (scraping, NER extraction)
- [ ] API authentication/authorization (JWT)
- [ ] PDF extraction (OCR)
- [ ] Multi-language support (German, English, Spanish)

### 📋 Coming in Phase 2+
- [ ] MedDRA coding
- [ ] Integration with Argus Safety / ARISg
- [ ] GxP validation (IQ/OQ/PQ)
- [ ] EMA/FDA data export
- [ ] Multi-tenancy support

## Development Workflow

### 1. Create a new drug
```bash
curl -X POST http://localhost:8000/api/v1/drugs \
  -H "Content-Type: application/json" \
  -d '{
    "active_ingredient": "Ibuprofen",
    "brand_names": ["Advil", "Motrin"],
    "atc_code": "M01AE01"
  }'
```

### 2. Trigger a search (will be automated)
```bash
# Manual scrape (for testing)
# TODO: Implement via Celery
```

### 3. View pending findings in approval queue
```bash
curl http://localhost:8000/api/v1/findings/pending
```

### 4. QPPV approves a finding
```bash
curl -X POST http://localhost:8000/api/v1/findings/{finding_id}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Verified against source. High confidence.",
    "decision": "approve"
  }'
```

### 5. Check audit trail
```bash
curl http://localhost:8000/api/v1/audit-logs
```

## Database Schema

See `backend/database.py` for full ORM model definitions.

**Core tables:**
- `drugs` — Drug/active ingredient records
- `sources` — Web sources (URLs, PDFs, articles)
- `findings` — Extracted safety-relevant information
- `finding_comments` — QPPV review comments
- `audit_logs` — Immutable audit trail (GVP Module VI)

## Testing

```bash
# Run unit tests
cd backend
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

## Deployment

### Railway.app (Recommended for MVP)

Deploy to [Railway.app](https://railway.app) in minutes:

```bash
# 1. Create Railway project from GitHub
# 2. Connect to your pharmavig-mvp repository
# 3. Add PostgreSQL and Redis services
# 4. Set environment variables (see .env.railway)
# 5. Push to main branch → auto-deploys

git push origin main

# Verify deployment
curl https://your-app.up.railway.app/health
# Expected: {"status":"ok","version":"1.0.0","database":"ok"}
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.**

### Production Checklist
- [ ] Generate strong `SECRET_KEY` (in Railway UI)
- [ ] Set `DEBUG=False` in Railway variables
- [ ] Add PostgreSQL service on Railway
- [ ] Add Redis service on Railway
- [ ] Configure CORS origins for production domain
- [ ] Test `/health` endpoint returns `database: ok`
- [ ] Run migrations: check Railway logs for `alembic upgrade head`
- [ ] Monitor logs in Railway UI
- [ ] Set up backups (Railway provides automated backups)

## Getting Started with Development

- **First time?** Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup and workflow
- **Ready to deploy?** Follow [DEPLOYMENT.md](DEPLOYMENT.md) for Railway.app
- **New contributor?** Check out the `develop` branch and create a `feature/*` branch

## Next Steps (Phase 2+)

1. **Frontend**: Create React UI for search, results, approval queue
2. **Celery**: Set up background job queue for scraping + NER extraction (Redis ready)
3. **NLP improvements**: Fine-tune NER on pharma corpus
4. **Testing**: Expand unit + integration tests (basic structure in place)
5. **CI/CD**: Add GitHub Actions for auto-testing (setup deferred)
6. **Authentication**: JWT-based API auth for users/roles

## Support & Contributing

For questions or issues, contact the pharmacovigilance team.

---

**MVP Version**: 1.0  
**Last Updated**: 2026-05-13  
**Status**: In active development
