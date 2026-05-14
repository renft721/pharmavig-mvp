FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model early (before copying code)
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x /app/backend/entrypoint.sh || chmod +x /app/entrypoint.sh

EXPOSE 8000

# Health check for Railway load balancer
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Use entrypoint script for migrations
ENTRYPOINT ["/bin/bash"]
CMD ["-c", "cd backend && /bin/bash ./entrypoint.sh || /bin/bash ./entrypoint.sh"]
