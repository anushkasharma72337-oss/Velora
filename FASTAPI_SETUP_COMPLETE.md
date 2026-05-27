# FastAPI Backend - Complete Setup Guide

## 🎉 Backend Successfully Created!

A production-ready FastAPI backend for your AI-powered startup feedback platform has been created with all required features, clean architecture, and best practices.

## 📁 Backend Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py              # Authentication (register, login, refresh token)
│   │   │   ├── product.py           # Products & categories
│   │   │   ├── review.py            # Reviews & ratings
│   │   │   ├── comment_vote.py      # Comments & upvote/downvote
│   │   │   ├── admin.py             # Admin moderation
│   │   │   └── __init__.py
│   │   └── __init__.py
│   │
│   ├── core/
│   │   ├── config.py                # Settings & environment variables
│   │   ├── security.py              # JWT & password hashing
│   │   └── __init__.py
│   │
│   ├── models/
│   │   ├── base.py                  # SQLAlchemy ORM models
│   │   │                             # - User (user, founder, admin roles)
│   │   │                             # - Product & ProductCategory
│   │   │                             # - Review & Rating
│   │   │                             # - Comment
│   │   │                             # - Vote (upvote/downvote)
│   │   │                             # - SavedProduct
│   │   └── __init__.py
│   │
│   ├── schemas/
│   │   ├── base.py                  # Pydantic validation schemas
│   │   │                             # Request/response models for all resources
│   │   └── __init__.py
│   │
│   ├── services/
│   │   ├── auth.py                  # Authentication logic
│   │   ├── product.py               # Product operations & business logic
│   │   ├── review.py                # Review & rating operations
│   │   ├── comment.py               # Comment operations
│   │   ├── vote.py                  # Vote operations
│   │   └── __init__.py
│   │
│   ├── middleware/
│   │   ├── custom.py                # Error handling & logging middleware
│   │   └── __init__.py
│   │
│   ├── utils/
│   │   ├── helpers.py               # Utility functions (slugify, validate_email)
│   │   ├── errors.py                # Custom exceptions
│   │   └── __init__.py
│   │
│   ├── main.py                      # FastAPI application setup
│   └── __init__.py
│
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore file
├── run.py                          # Application entry point
├── init_db.py                      # Database initialization script
├── tests.py                        # Sample tests
├── API_EXAMPLES.md                 # Example API requests
└── README.md                       # Documentation
```

## 🚀 Quick Start

### 1. **Environment Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

### 3. **Configure Environment**

```bash
# Copy example to actual env file
cp .env.example .env

# Edit .env with your settings:
# - DATABASE_URL: PostgreSQL connection string
# - SUPABASE_URL & SUPABASE_KEY: If using Supabase
# - SECRET_KEY: Change to a strong random string for production
# - GEMINI_API_KEY: For AI insights
```

### 4. **Initialize Database**

```bash
python init_db.py
```

This creates:
- All database tables
- Default product categories
- Admin user (admin@example.com / admin123)

### 5. **Run the Server**

```bash
python run.py
```

Server will start at `http://localhost:8000`

## 📚 API Documentation

**Interactive API Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔑 Key Features Implemented

### ✅ Authentication
- User registration with role selection
- JWT-based login system
- Token refresh mechanism
- Password hashing with bcrypt
- User profile management

### ✅ Authorization
- Three user roles: User, Founder, Admin
- Role-based access control
- Dependency injection for protected endpoints

### ✅ Products
- Create, read, update, delete products
- Product categories
- Publish/featured status
- Save/bookmark functionality
- Product slug for URL-friendly access
- Automatic rating aggregation

### ✅ Reviews & Ratings
- Comprehensive review system
- 1-5 star ratings
- Review helpfulness tracking
- AI summary field for future use
- Separate rating model for flexibility

### ✅ Comments
- Comment on reviews
- Comment flagging for moderation
- Nested comment support ready

### ✅ Voting System
- Upvote/downvote on reviews
- Automatic helpful/unhelpful count tracking
- Vote toggling support

### ✅ Admin Features
- Flagged comments management
- Product featuring/unfeaturing
- Comment moderation tools
- Admin-only endpoints protection

### ✅ Architecture
- Clean separation of concerns (routes, services, models, schemas)
- Pydantic models for input validation
- SQLAlchemy ORM for database operations
- Comprehensive error handling
- Request logging middleware
- CORS support
- Trusted host middleware

## 📋 Database Models

### Users Table
```
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- full_name
- bio
- role (enum: user, founder, admin)
- is_active
- is_verified
- avatar_url
- created_at, updated_at
```

### Products Table
```
- id (PK)
- name
- slug (unique)
- description
- logo_url
- website_url
- category_id (FK)
- owner_id (FK) → User
- is_published
- is_featured
- average_rating
- review_count
- created_at, updated_at
```

### Reviews Table
```
- id (PK)
- product_id (FK)
- reviewer_id (FK) → User
- title
- content
- rating (1-5)
- is_verified_purchase
- helpful_count
- unhelpful_count
- ai_summary
- created_at, updated_at
```

### Ratings Table
```
- id (PK)
- product_id (FK)
- user_id (FK) → User
- score (1-5)
- unique constraint: (product_id, user_id)
- created_at, updated_at
```

### Comments Table
```
- id (PK)
- review_id (FK)
- author_id (FK) → User
- content
- is_flagged
- created_at, updated_at
```

### Votes Table
```
- id (PK)
- review_id (FK)
- user_id (FK) → User
- vote_type (enum: upvote, downvote)
- unique constraint: (review_id, user_id)
- created_at
```

### SavedProducts Table
```
- id (PK)
- user_id (FK)
- product_id (FK)
- unique constraint: (user_id, product_id)
- created_at
```

### ProductCategories Table
```
- id (PK)
- name (unique)
- slug (unique)
- description
- icon
- created_at
```

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing algorithm
   - Strong password validation

2. **JWT Authentication**
   - Short-lived access tokens (30 min default)
   - Refresh tokens for extended sessions
   - HS256 algorithm

3. **Authorization**
   - Role-based access control
   - Dependency injection for auth checks
   - Ownership verification for resource updates

4. **API Security**
   - CORS protection
   - Trusted host middleware
   - Request validation with Pydantic
   - Error handling without exposing internals

5. **Database**
   - ORM prevents SQL injection
   - Proper constraint enforcement

## 🧪 Testing

Sample test file included at `tests.py`

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

Tests cover:
- Health checks
- User registration
- Login functionality
- Duplicate prevention
- Current user profile
- And more...

## 📝 API Endpoints Summary

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update user profile |
| GET | `/api/auth/users/{id}` | Get user by ID |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products/` | Create product |
| GET | `/api/products/` | List products |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| POST | `/api/products/{id}/save` | Save product |
| DELETE | `/api/products/{id}/save` | Unsave product |
| GET | `/api/products/saved` | Get saved products |

### Review Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews/` | Create review |
| GET | `/api/reviews/{id}` | Get review |
| GET | `/api/reviews/product/{id}` | Get product reviews |
| PUT | `/api/reviews/{id}` | Update review |
| DELETE | `/api/reviews/{id}` | Delete review |
| POST | `/api/reviews/rating` | Rate product |
| GET | `/api/reviews/rating/{id}` | Get user rating |
| DELETE | `/api/reviews/rating/{id}` | Delete rating |

### Comment & Vote Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments` | Create comment |
| GET | `/api/reviews/{id}/comments` | Get review comments |
| PUT | `/api/comments/{id}` | Update comment |
| DELETE | `/api/comments/{id}` | Delete comment |
| POST | `/api/comments/{id}/flag` | Flag comment |
| POST | `/api/votes` | Vote on review |
| GET | `/api/votes/review/{id}` | Get user vote |
| DELETE | `/api/votes/review/{id}` | Remove vote |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/comments/flagged` | Get flagged comments |
| PUT | `/api/admin/comments/{id}/unflag` | Unflag comment |
| DELETE | `/api/admin/comments/{id}` | Delete comment |
| PUT | `/api/admin/products/{id}/feature` | Feature product |
| PUT | `/api/admin/products/{id}/unfeature` | Unfeature product |

## 🔧 Configuration

Edit `.env` to configure:

```env
# Database
DATABASE_URL=postgresql+psycopg2://user:pass@localhost/dbname

# Supabase (optional)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# JWT
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# API
API_TITLE=PS Feedback Platform API
API_VERSION=1.0.0
ENVIRONMENT=development

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# AI
GEMINI_API_KEY=your-gemini-api-key
```

## 📦 Dependencies

Key packages installed:
- **fastapi**: Web framework
- **sqlalchemy**: ORM
- **psycopg2**: PostgreSQL driver
- **pydantic**: Data validation
- **python-jose**: JWT handling
- **passlib**: Password hashing
- **uvicorn**: ASGI server
- **pytest**: Testing framework

See `requirements.txt` for full list.

## 🚀 Production Deployment

1. **Environment**
   - Set `ENVIRONMENT=production` in `.env`
   - Generate strong `SECRET_KEY`
   - Use production database URL

2. **Security**
   - Enable HTTPS/SSL
   - Set appropriate CORS origins
   - Implement rate limiting
   - Use environment variables for secrets

3. **Process Management**
   - Use Gunicorn or similar ASGI server
   - Configure process supervisor (systemd, supervisord)

   ```bash
   # Example with Gunicorn
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

4. **Database**
   - Use managed PostgreSQL (AWS RDS, Supabase, etc.)
   - Enable automated backups
   - Set up monitoring

5. **Monitoring**
   - Set up logging aggregation
   - Configure error tracking (Sentry)
   - Monitor API performance

## 📚 Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- SQLAlchemy Docs: https://www.sqlalchemy.org
- Pydantic Docs: https://docs.pydantic.dev
- PostgreSQL Docs: https://www.postgresql.org/docs

## 🤝 Next Steps

1. **Update `.env`** with your database and API credentials
2. **Run `init_db.py`** to initialize the database
3. **Start the server** with `python run.py`
4. **Access API docs** at http://localhost:8000/docs
5. **Test endpoints** using Swagger UI or provided examples
6. **Integrate with frontend** (set CORS origins appropriately)
7. **Deploy to production** following deployment guide

## 📞 Support

For issues or questions:
1. Check the comprehensive README.md in backend folder
2. Review API_EXAMPLES.md for endpoint examples
3. Examine tests.py for implementation patterns
4. Check individual route files for endpoint details

---

**Backend successfully created!** 🎉

All files are organized, well-documented, and ready for development and production deployment.
