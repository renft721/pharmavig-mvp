# CLAUDE CODE — PHARMAVIG MVP DEVELOPMENT GUIDE

## What is Claude Code?

Claude Code is a command-line tool that lets you work with me (Claude) to develop, refactor, and test code. You type commands, I execute them and show you the results.

## Getting Started with This Project

### 1. Clone the Repository into Claude Code

```bash
# Navigate to where you want the project
cd ~/projects

# Clone or copy the pharmavig-mvp folder
# (If you're using GitHub: git clone <repo-url>)
# (If from local: copy the pharmavig-mvp folder here)

# Navigate into the project
cd pharmavig-mvp
```

### 2. Start the Development Environment

#### Option A: Docker Compose (Recommended)

```bash
# Make sure Docker is running on your machine
docker-compose up -d

# Wait ~30 seconds for services to start
sleep 30

# Check health
curl http://localhost:8000/health
```

**Services that will be running:**
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- FastAPI backend on `localhost:8000`
- React frontend on `localhost:3000` (when built)

#### Option B: Local Python Environment

```bash
# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Set environment variables
cp ../.env.example .env
# Edit .env if needed

# Run the server
uvicorn main:app --reload
```

### 3. Common Claude Code Commands

Here are the commands you'll use frequently:

#### View Files
```bash
# See the structure
ls -la

# View a Python file
cat backend/main.py

# View routes
cat backend/routes/drugs.py

# See database models
cat backend/database.py
```

#### Edit Files
Tell me directly: `"Change the database URL in config.py"` or `"Add a new endpoint to drugs.py"`

I'll use the editor to modify files.

#### Run Tests
```bash
cd backend
pytest tests/ -v

# Test a specific file
pytest tests/test_scrapers.py -v

# Run with coverage
pytest --cov=. tests/
```

#### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# List drugs
curl http://localhost:8000/api/v1/drugs

# Create a drug
curl -X POST http://localhost:8000/api/v1/drugs \
  -H "Content-Type: application/json" \
  -d '{
    "active_ingredient": "Ibuprofen",
    "brand_names": ["Advil"],
    "atc_code": "M01AE01"
  }'

# Get pending findings (approval queue)
curl http://localhost:8000/api/v1/findings/pending

# Get audit logs
curl http://localhost:8000/api/v1/audit-logs
```

#### Check Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U pharmavig -d pharmavig_mvp

# Once in psql prompt:
\dt                                    # List tables
SELECT * FROM drugs;                  # List drugs
SELECT * FROM findings;               # List findings
SELECT * FROM audit_logs;             # List audit trail
\q                                     # Exit
```

#### View Logs
```bash
# Backend logs
docker-compose logs backend -f

# Postgres logs
docker-compose logs postgres -f

# All services
docker-compose logs -f
```

#### Restart Services
```bash
# Restart backend only
docker-compose restart backend

# Restart all
docker-compose restart

# Stop all
docker-compose down

# Start again
docker-compose up -d
```

## Development Workflow in Claude Code

### Task 1: Fix a Bug

**You say:** "There's a bug in the drug creation endpoint. It's not storing the ATC code."

**I do:**
1. View the affected file (`cat backend/routes/drugs.py`)
2. Find the bug
3. Show you the fix
4. You approve → I implement it
5. Test it: `curl -X POST ... ` (test the endpoint)

### Task 2: Add a New Feature

**You say:** "Add a new endpoint to filter findings by severity level"

**I do:**
1. Ask clarifying questions (if needed)
2. View the findings routes (`cat backend/routes/findings.py`)
3. Add the new endpoint
4. Test it
5. Show you the result

### Task 3: Implement the NLP Pipeline

**You say:** "Implement the adverse_reaction extraction in nlp.py"

**I do:**
1. View current NLP code
2. Implement the extraction logic
3. Create unit tests
4. Show you test results
5. Integrate with the API if needed

## Next Phases & What to Do

### Phase 1 (Weeks 1–3): Scraper + DB
✅ **DONE** (scaffolding complete)
- Web scraper for Aerzteblatt
- PDF extraction (basic)
- PostgreSQL schema
- Audit trail ready

### Phase 2 (Weeks 3–6): NLP + Extraction
🚧 **START HERE**
```bash
# Tasks:
# 1. Complete nlp.py extraction functions
# 2. Add unit tests for NLP
# 3. Integrate with API (create findings)
# 4. Test end-to-end: search → extract → approve

# Command: "Implement the _extract_adverse_reactions function in nlp.py"
```

### Phase 3 (Weeks 5–7): Frontend + UI
❌ **NOT STARTED**
- React search page
- Results display
- Approval queue dashboard
- User authentication

```bash
# When ready: "Create a React frontend with Vite"
```

### Phase 4 (Weeks 7–10): Celery + Scheduling
❌ **NOT STARTED**
- Background jobs
- Cron scheduling
- Real-time notifications

```bash
# When ready: "Set up Celery tasks for scraping and extraction"
```

## Example: How to Use Claude Code Right Now

### Scenario 1: "Make the scraper smarter"

**You**: "Can you improve the Aerzteblatt scraper to handle pagination?"

**Me**: 
1. I view `backend/scrapers.py`
2. I show you the current code
3. I ask: "What pagination pattern does Aerzteblatt use? (URL params? Link elements?)"
4. You answer
5. I implement it
6. We test together:
   ```bash
   # Add test code
   python -c "
   from scrapers import AerzteblattScraper
   scraper = AerzteblattScraper()
   results = scraper.search_drug('Ibuprofen', max_results=100)
   print(f'Found {len(results)} articles')
   "
   ```

### Scenario 2: "Fix the approval workflow"

**You**: "The QPPV approval endpoint isn't updating the finding status correctly."

**Me**:
1. I view `backend/routes/findings.py`
2. I spot the bug: `finding.status = FindingStatus.APPROVED` isn't being committed
3. I show you the issue
4. I fix it
5. We test the endpoint

### Scenario 3: "Add a new filter"

**You**: "I want to filter findings by date range."

**Me**:
1. I view the findings routes
2. I ask: "Do you want to filter by extraction_date or source publication_date?"
3. I add a new endpoint: `GET /api/v1/findings?start_date=...&end_date=...`
4. We test it

## Tips for Working Efficiently in Claude Code

1. **Be specific**: Instead of "fix the code", say "the drug creation endpoint doesn't save the ATC code"

2. **Show me errors**: If something breaks, copy the full error message

3. **Suggest improvements**: "The NER model is too slow. Can we add caching?" → I implement it

4. **Ask for explanations**: "Explain how the approval workflow works" → I'll diagram it or show you

5. **Test after changes**: Always run `pytest` or a curl command after I make changes

6. **Use git**: Commit regularly so you can revert if needed
   ```bash
   git add .
   git commit -m "Add adverse reaction extraction"
   git push
   ```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Restart
docker-compose restart backend

# If still broken: nuke and rebuild
docker-compose down -v
docker-compose up -d
```

### Database connection error
```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Check DB exists
docker-compose exec postgres psql -U pharmavig -l

# Recreate DB if needed
docker-compose down -v
docker-compose up -d
```

### Dependency issues
```bash
# Update dependencies
cd backend
pip install --upgrade -r requirements.txt

# Rebuild Docker image
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Your First Commands in Claude Code

Try these now:

1. **See the project structure**
   ```bash
   tree -L 3 pharmavig-mvp/ | head -30
   ```

2. **Check if services are running**
   ```bash
   curl http://localhost:8000/health
   ```

3. **List the API routes**
   ```bash
   cat backend/main.py | grep "include_router"
   ```

4. **View the database schema**
   ```bash
   cat backend/database.py | grep "class.*Base"
   ```

## Example: Create Your First Drug

```bash
# 1. Create a drug
curl -X POST http://localhost:8000/api/v1/drugs \
  -H "Content-Type: application/json" \
  -d '{
    "active_ingredient": "Aspirin",
    "brand_names": ["Bayer"],
    "atc_code": "N02BA01"
  }'

# 2. Get all drugs
curl http://localhost:8000/api/v1/drugs | python -m json.tool

# 3. See audit log
curl http://localhost:8000/api/v1/audit-logs | python -m json.tool
```

## Next: What Should We Build?

Ask me any of these in Claude Code:

- **"Implement the adverse reaction extraction in NLP"** → I'll complete nlp.py
- **"Add unit tests for the scraper"** → I'll create tests/test_scrapers.py
- **"Create a React component for the search page"** → I'll scaffold the frontend
- **"Set up Celery for background jobs"** → I'll configure tasks
- **"Add authentication to the API"** → I'll implement JWT
- **"Document the API in Swagger"** → Already done! Visit /docs

---

**You're ready! Start with:** `"Let's implement the full NLP extraction pipeline."`
