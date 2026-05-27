"""FastAPI Backend for AI-Powered Startup Feedback Platform"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core import get_settings
from app.api import api_router
from app.middleware import ErrorHandlingMiddleware, LoggingMiddleware
from app.models import Base, engine
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="API for AI-powered startup feedback platform"
)

# Create database tables
Base.metadata.create_all(bind=engine)


# ==================== Middleware ====================

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Add trusted host middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*.example.com"])


# ==================== Routes ====================

@app.get("/", tags=["Health"])
async def root():
    """API health check"""
    return {
        "message": "Welcome to PS Feedback Platform API",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


# Include API routes
app.include_router(api_router)


# ==================== Startup/Shutdown ====================

@app.on_event("startup")
async def startup_event():
    """Run on startup"""
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("Database tables created")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on shutdown"""
    logger.info(f"Shutting down {settings.API_TITLE}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )
