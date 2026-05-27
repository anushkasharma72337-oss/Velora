# Backend Directory Tree

```
ps-main/backend/
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore configuration
├── API_EXAMPLES.md                 # Example API requests for all endpoints
├── README.md                       # Complete backend documentation
├── requirements.txt                # All Python dependencies
├── run.py                         # Application entry point - python run.py
├── init_db.py                     # Database initialization script
├── tests.py                       # Sample pytest test suite
│
└── app/                           # Main application package
    ├── __init__.py
    ├── main.py                    # FastAPI application setup
    │
    ├── api/                       # API routes and endpoints
    │   ├── __init__.py
    │   └── routes/
    │       ├── __init__.py
    │       ├── auth.py            # Authentication endpoints (6)
    │       │   • POST /register
    │       │   • POST /login
    │       │   • POST /refresh
    │       │   • GET /me
    │       │   • PUT /me
    │       │   • GET /users/{id}
    │       │
    │       ├── product.py         # Product endpoints (8)
    │       │   • POST / (create)
    │       │   • GET / (list)
    │       │   • GET /{id}
    │       │   • GET /slug/{slug}
    │       │   • PUT /{id}
    │       │   • DELETE /{id}
    │       │   • POST /{id}/save
    │       │   • GET /saved
    │       │
    │       ├── review.py          # Review & rating endpoints (9)
    │       │   • POST / (review)
    │       │   • GET /{id}
    │       │   • GET /product/{id}
    │       │   • PUT /{id}
    │       │   • DELETE /{id}
    │       │   • POST /rating
    │       │   • GET /rating/{id}
    │       │   • DELETE /rating/{id}
    │       │
    │       ├── comment_vote.py    # Comments & votes (8)
    │       │   • POST /comments
    │       │   • GET /comments/{id}
    │       │   • GET /reviews/{id}/comments
    │       │   • PUT /comments/{id}
    │       │   • DELETE /comments/{id}
    │       │   • POST /comments/{id}/flag
    │       │   • POST /votes
    │       │   • DELETE /votes/review/{id}
    │       │
    │       └── admin.py           # Admin endpoints (5)
    │           • GET /comments/flagged
    │           • PUT /comments/{id}/unflag
    │           • DELETE /comments/{id}
    │           • PUT /products/{id}/feature
    │           • PUT /products/{id}/unfeature
    │
    ├── core/                      # Core configuration and security
    │   ├── __init__.py
    │   ├── config.py              # Settings and environment variables
    │   │   • DatabaseURL
    │   │   • JWT configuration
    │   │   • API settings
    │   │   • CORS origins
    │   │   • Gemini API key
    │   │
    │   └── security.py            # Authentication and security
    │       • Password hashing (bcrypt)
    │       • JWT token creation
    │       • JWT token verification
    │       • get_current_user() dependency
    │       • get_current_admin() dependency
    │
    ├── models/                    # Database models (SQLAlchemy ORM)
    │   ├── __init__.py
    │   └── base.py                # 8 database models
    │       • User (roles: user, founder, admin)
    │       • Product
    │       • ProductCategory
    │       • Review
    │       • Rating
    │       • Comment
    │       • Vote (upvote/downvote)
    │       • SavedProduct
    │
    ├── schemas/                   # Request/Response validation (Pydantic)
    │   ├── __init__.py
    │   └── base.py                # Comprehensive schemas
    │       • UserBase, UserCreate, UserResponse
    │       • LoginRequest, TokenResponse
    │       • ProductBase, ProductCreate, ProductResponse
    │       • ReviewBase, ReviewCreate, ReviewResponse
    │       • RatingBase, RatingCreate, RatingResponse
    │       • CommentBase, CommentCreate, CommentResponse
    │       • VoteCreate, VoteResponse
    │       • SavedProductResponse
    │       • PaginationParams, PaginatedResponse
    │
    ├── services/                  # Business logic layer
    │   ├── __init__.py
    │   ├── auth.py                # Authentication service
    │   │   • register_user()
    │   │   • authenticate_user()
    │   │   • get_user_by_id()
    │   │   • get_user_by_email()
    │   │
    │   ├── product.py             # Product service
    │   │   • create_product()
    │   │   • get_product_by_id()
    │   │   • get_all_products()
    │   │   • update_product()
    │   │   • delete_product()
    │   │   • save_product()
    │   │   • get_saved_products()
    │   │
    │   ├── review.py              # Review and rating service
    │   │   • create_review()
    │   │   • get_product_reviews()
    │   │   • update_review()
    │   │   • delete_review()
    │   │   • rate_product()
    │   │   • get_user_rating()
    │   │   • delete_rating()
    │   │
    │   ├── comment.py             # Comment service
    │   │   • create_comment()
    │   │   • get_review_comments()
    │   │   • update_comment()
    │   │   • delete_comment()
    │   │   • flag_comment()
    │   │
    │   └── vote.py                # Vote/helpful service
    │       • vote_review()
    │       • get_user_vote()
    │       • remove_vote()
    │
    ├── middleware/                # Custom middleware
    │   ├── __init__.py
    │   └── custom.py
    │       • ErrorHandlingMiddleware
    │       • LoggingMiddleware
    │
    └── utils/                     # Utility functions and exceptions
        ├── __init__.py
        ├── helpers.py             # Utility functions
        │   • slugify()
        │   • validate_email()
        │   • paginate_query()
        │
        └── errors.py              # Custom exceptions
            • AppException
            • ResourceNotFoundError
            • UnauthorizedError
            • ForbiddenError
            • ConflictError
            • ValidationError
```

## Statistics

- **Total Files**: 35+
- **Python Modules**: 25+
- **API Endpoints**: 40+
- **Database Models**: 8
- **Database Tables**: 8
- **Pydantic Schemas**: 25+
- **Service Classes**: 6
- **API Route Handlers**: 40+
- **Lines of Code**: 3000+

## Key Endpoints by Category

### Authentication (6 endpoints)
- Register, Login, Refresh, Get Profile, Update Profile, Get User

### Products (8 endpoints)
- CRUD operations, Save/unsave, Product categories

### Reviews (9 endpoints)
- Create, read, update, delete reviews and ratings

### Comments & Votes (8 endpoints)
- Create, read, update, delete comments
- Upvote, downvote, remove votes

### Admin (5 endpoints)
- Manage flagged comments, feature products

### Health (2 endpoints)
- Root and health check endpoints

## Technologies Used

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **ORM**: SQLAlchemy 2.0.23
- **Database**: PostgreSQL (Psycopg2)
- **Validation**: Pydantic 2.5.0
- **Authentication**: Python-Jose, PyJWT
- **Password**: Passlib with Bcrypt
- **Testing**: Pytest with AsyncIO
- **Environment**: Python-dotenv

## Architecture Layers

1. **API Layer** (`api/routes/`) - HTTP endpoints
2. **Service Layer** (`services/`) - Business logic
3. **Model Layer** (`models/`) - Database ORM
4. **Schema Layer** (`schemas/`) - Validation
5. **Middleware Layer** (`middleware/`) - Request/response processing
6. **Core Layer** (`core/`) - Configuration and security
7. **Utility Layer** (`utils/`) - Helpers and exceptions

## Database Schema

### Users
id, username, email, hashed_password, full_name, bio, role, is_active, is_verified, avatar_url, created_at, updated_at

### Products
id, name, slug, description, logo_url, website_url, category_id, owner_id, is_published, is_featured, average_rating, review_count, created_at, updated_at

### ProductCategories
id, name, slug, description, icon, created_at

### Reviews
id, product_id, reviewer_id, title, content, rating, is_verified_purchase, helpful_count, unhelpful_count, ai_summary, created_at, updated_at

### Ratings
id, product_id, user_id, score, created_at, updated_at (unique: product_id, user_id)

### Comments
id, review_id, author_id, content, is_flagged, created_at, updated_at

### Votes
id, review_id, user_id, vote_type, created_at (unique: review_id, user_id)

### SavedProducts
id, user_id, product_id, created_at (unique: user_id, product_id)

---

**All files are ready to use! Start the server and begin developing.** 🚀
