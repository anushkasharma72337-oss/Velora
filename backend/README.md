# FastAPI Backend - PS Feedback Platform

## Overview
Production-ready FastAPI backend for AI-powered startup feedback platform with JWT authentication, product management, reviews, ratings, comments, and admin moderation.

## Features
- ✅ User authentication (registration & login)
- ✅ JWT-based authorization
- ✅ Founder and Admin roles
- ✅ Product management with categories
- ✅ Review system with ratings
- ✅ Comments on reviews
- ✅ Upvote/downvote system
- ✅ Save/bookmark products
- ✅ Admin moderation tools
- ✅ Comprehensive error handling
- ✅ Request logging and middleware
- ✅ Pydantic validation
- ✅ Clean architecture

## Project Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── product.py       # Product endpoints
│   │   │   ├── review.py        # Review & rating endpoints
│   │   │   ├── comment_vote.py  # Comments & votes
│   │   │   └── admin.py         # Admin endpoints
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py            # Configuration settings
│   │   ├── security.py          # JWT & password utilities
│   │   └── __init__.py
│   ├── models/
│   │   ├── base.py              # SQLAlchemy models
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── base.py              # Pydantic schemas
│   │   └── __init__.py
│   ├── services/
│   │   ├── auth.py              # Authentication logic
│   │   ├── product.py           # Product operations
│   │   ├── review.py            # Review operations
│   │   ├── comment.py           # Comment operations
│   │   ├── vote.py              # Vote operations
│   │   └── __init__.py
│   ├── middleware/
│   │   ├── custom.py            # Custom middleware
│   │   └── __init__.py
│   ├── utils/
│   │   ├── helpers.py           # Helper functions
│   │   ├── errors.py            # Custom exceptions
│   │   └── __init__.py
│   ├── main.py                  # FastAPI application
│   └── __init__.py
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables example
├── run.py                       # Application entry point
└── README.md
```

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL (or Supabase)
- pip or poetry

### Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the application**
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user

### Products
- `POST /api/products/` - Create product
- `GET /api/products/` - List products
- `GET /api/products/{product_id}` - Get product details
- `PUT /api/products/{product_id}` - Update product
- `DELETE /api/products/{product_id}` - Delete product
- `POST /api/products/{product_id}/save` - Save product
- `DELETE /api/products/{product_id}/save` - Unsave product
- `GET /api/products/saved` - Get saved products

### Reviews
- `POST /api/reviews/` - Create review
- `GET /api/reviews/{review_id}` - Get review
- `GET /api/reviews/product/{product_id}` - Get product reviews
- `PUT /api/reviews/{review_id}` - Update review
- `DELETE /api/reviews/{review_id}` - Delete review

### Ratings
- `POST /api/reviews/rating` - Rate product
- `GET /api/reviews/rating/{product_id}` - Get user rating
- `DELETE /api/reviews/rating/{product_id}` - Delete rating

### Comments & Votes
- `POST /api/comments` - Create comment
- `GET /api/reviews/{review_id}/comments` - Get review comments
- `PUT /api/comments/{comment_id}` - Update comment
- `DELETE /api/comments/{comment_id}` - Delete comment
- `POST /api/votes` - Vote on review
- `DELETE /api/votes/review/{review_id}` - Remove vote

### Admin
- `GET /api/admin/comments/flagged` - Get flagged comments
- `PUT /api/admin/comments/{comment_id}/unflag` - Unflag comment
- `PUT /api/admin/products/{product_id}/feature` - Feature product

## Database Models

### Users
- Supports user, founder, and admin roles
- Password hashing with bcrypt
- Profile information

### Products
- Name, description, logo, website
- Categories and ownership
- Rating and review count tracking

### Reviews
- Title, content, rating (1-5)
- Helpful/unhelpful counts
- AI summary field for insights

### Ratings
- Separate from reviews for flexibility
- One rating per user per product

### Comments
- Comments on reviews
- Flagging for moderation

### Votes
- Upvote/downvote on reviews
- Helpful tracking

### SavedProducts
- User's bookmarked products

## Configuration

Edit `.env` to configure:
- Database connection
- Supabase credentials
- JWT settings
- API settings
- CORS origins
- Gemini AI settings

## Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- CORS protection
- Trusted host middleware
- Request validation with Pydantic
- Error handling

## Development

### Running tests
```bash
pytest
```

### Database migrations
If using Alembic:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Environment Variables

See `.env.example` for all available options.

## Error Handling
The API includes comprehensive error handling:
- Validation errors (422)
- Not found errors (404)
- Unauthorized errors (401)
- Forbidden errors (403)
- Conflict errors (409)
- Server errors (500)

## Logging
Request/response logging is configured via middleware. Check logs for:
- Request method, path, and status
- Processing duration
- Error details

## Production Deployment
1. Set `ENVIRONMENT=production` in `.env`
2. Use strong `SECRET_KEY`
3. Configure proper database
4. Set appropriate CORS origins
5. Use process manager (gunicorn, supervisord)
6. Enable HTTPS
7. Configure rate limiting

## License
Proprietary - All rights reserved
