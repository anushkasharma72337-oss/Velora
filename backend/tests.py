"""
Sample tests for the FastAPI application

Run with: pytest
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models import Base, get_db
from app.core import SecurityUtils

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ==================== Health Tests ====================

def test_health_check():
    """Test API health check"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


# ==================== Authentication Tests ====================

def test_register_user():
    """Test user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
            "role": "user"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_register_duplicate_email():
    """Test duplicate email registration"""
    # First registration
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser1",
            "email": "test1@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    
    # Duplicate registration
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser2",
            "email": "test1@example.com",
            "password": "testpass123",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400


def test_login():
    """Test user login"""
    # Register user
    client.post(
        "/api/auth/register",
        json={
            "username": "logintest",
            "email": "login@example.com",
            "password": "testpass123",
            "full_name": "Login Test"
        }
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


# ==================== Example Test with Auth ====================

def test_get_current_user():
    """Test getting current user profile"""
    # Register and login
    client.post(
        "/api/auth/register",
        json={
            "username": "profiletest",
            "email": "profile@example.com",
            "password": "testpass123",
            "full_name": "Profile Test"
        }
    )
    
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "profile@example.com",
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get user profile
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "profile@example.com"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
