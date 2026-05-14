# Contributing to Pharmavig MVP

## Development Setup

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Node.js 20+ (for frontend development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pharmavig-mvp.git
   cd pharmavig-mvp
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose** (recommended)
   ```bash
   docker-compose up -d
   
   # Wait for services to start (~30 seconds)
   sleep 30
   
   # Check API is running
   curl http://localhost:8000/health
   ```

4. **Or run locally without Docker**

   **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   
   # Update .env with local database URL
   # DATABASE_URL=postgresql://user:password@localhost:5432/pharmavig_mvp
   
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   **Frontend** (when ready):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Workflow

### Branch Naming
- `main` — production-ready code
- `develop` — staging/integration branch
- `feature/feature-name` — feature branches
- `bugfix/issue-name` — bug fix branches

### Creating a Pull Request

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `pytest backend/tests/`
4. Commit with clear messages: `git commit -m "feat: add new endpoint"`
5. Push and create PR: `git push origin feature/my-feature`

### Running Tests

```bash
cd backend

# Run all tests
pytest tests/

# Run with coverage
pytest --cov=. tests/

# Run specific test file
pytest tests/test_health.py
```

### Code Quality

We use:
- **Black** — code formatting
- **flake8** — linting
- **pytest** — testing

To check before committing:
```bash
cd backend
black .
flake8 .
pytest tests/
```

## Database Migrations

Alembic is used for database migrations.

### Create a migration (after changing models)
```bash
cd backend
alembic revision --autogenerate -m "Add new column to drugs"
```

### Apply migrations
```bash
cd backend
alembic upgrade head
```

### Revert last migration
```bash
cd backend
alembic downgrade -1
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Common Issues

### "Database connection refused"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env matches your setup
- Wait 30+ seconds for docker-compose services to start

### "spaCy model not found"
```bash
python -m spacy download en_core_web_sm
```

### Port 8000 already in use
```bash
lsof -i :8000  # Find process
kill -9 <PID>   # Kill it
```

## Code of Conduct

Be respectful. Follow the project's vision for pharmacovigilance automation.

## Questions?

Check existing issues or open a new one with details.

---

**Thank you for contributing!** 🎉
