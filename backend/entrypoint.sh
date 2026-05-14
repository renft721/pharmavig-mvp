#!/bin/bash
set -e

echo "Starting Pharmacovigilance API entrypoint..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')" 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready"

# Run database migrations
echo "Running database migrations..."
cd /app/backend || cd /app
alembic upgrade head
echo "Migrations completed"

# Start the application
echo "Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
