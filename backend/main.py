"""
Pharmacovigilance AI Agent - Backend API
MVP Version 1.0
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from config import settings
from database import Base, engine, get_db
from routes import drugs, findings, searches, audit_logs

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Pharmacovigilance AI Agent API",
    description="MVP for automated drug safety monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """API health check endpoint with database connectivity check"""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = f"error: {str(e)}"

    overall_status = "ok" if db_status == "ok" else "degraded"

    return {
        "status": overall_status,
        "version": "1.0.0",
        "database": db_status
    }

# Include routers
app.include_router(drugs.router, prefix="/api/v1/drugs", tags=["Drugs"])
app.include_router(findings.router, prefix="/api/v1/findings", tags=["Findings"])
app.include_router(searches.router, prefix="/api/v1/searches", tags=["Searches"])
app.include_router(audit_logs.router, prefix="/api/v1/audit-logs", tags=["Audit Logs"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
