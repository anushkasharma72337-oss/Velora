#!/usr/bin/env python
"""Entry point for the FastAPI application"""
from app.main import app
import uvicorn

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
