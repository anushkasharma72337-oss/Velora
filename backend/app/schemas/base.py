from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


# ==================== User Schemas ====================

class UserRole(str, Enum):
    """User role enum"""
    USER = "user"
    FOUNDER = "founder"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, max_length=255)
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    avatar_url: Optional[str] = Field(None, max_length=500)


class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    """User profile with stats"""
    review_count: Optional[int] = 0
    products_count: Optional[int] = 0


# ==================== Authentication Schemas ====================

class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str


# ==================== Product Schemas ====================

class ProductCategoryBase(BaseModel):
    """Base product category schema"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = None


class ProductCategoryCreate(ProductCategoryBase):
    """Product category creation schema"""
    pass


class ProductCategoryResponse(ProductCategoryBase):
    """Product category response schema"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str
    logo_url: Optional[str] = Field(None, max_length=500)
    website_url: Optional[str] = Field(None, max_length=500)
    category_id: int


class ProductCreate(ProductBase):
    """Product creation schema"""
    pass


class ProductUpdate(BaseModel):
    """Product update schema"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    logo_url: Optional[str] = Field(None, max_length=500)
    website_url: Optional[str] = Field(None, max_length=500)
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    owner_id: int
    is_published: bool
    is_featured: bool
    average_rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserResponse] = None
    category: Optional[ProductCategoryResponse] = None
    
    class Config:
        from_attributes = True


class ProductDetailResponse(ProductResponse):
    """Product detail with reviews"""
    reviews: Optional[List['ReviewResponse']] = []


# ==================== Review Schemas ====================

class ReviewBase(BaseModel):
    """Base review schema"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str
    rating: int = Field(..., ge=1, le=5)


class ReviewCreate(ReviewBase):
    """Review creation schema"""
    pass


class ReviewUpdate(BaseModel):
    """Review update schema"""
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class ReviewResponse(ReviewBase):
    """Review response schema"""
    id: int
    product_id: int
    reviewer_id: int
    is_verified_purchase: bool
    helpful_count: int
    unhelpful_count: int
    ai_summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    reviewer: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class ReviewDetailResponse(ReviewResponse):
    """Review detail with comments"""
    comments: Optional[List['CommentResponse']] = []


# ==================== Rating Schemas ====================

class RatingBase(BaseModel):
    """Base rating schema"""
    score: int = Field(..., ge=1, le=5)


class RatingCreate(RatingBase):
    """Rating creation schema"""
    product_id: int


class RatingResponse(RatingBase):
    """Rating response schema"""
    id: int
    product_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Comment Schemas ====================

class CommentBase(BaseModel):
    """Base comment schema"""
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    """Comment creation schema"""
    pass


class CommentUpdate(BaseModel):
    """Comment update schema"""
    content: str = Field(..., min_length=1)


class CommentResponse(CommentBase):
    """Comment response schema"""
    id: int
    review_id: int
    author_id: int
    is_flagged: bool
    created_at: datetime
    updated_at: datetime
    author: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


# ==================== Vote Schemas ====================

class VoteType(str, Enum):
    """Vote type enum"""
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class VoteCreate(BaseModel):
    """Vote creation schema"""
    review_id: int
    vote_type: VoteType


class VoteResponse(BaseModel):
    """Vote response schema"""
    id: int
    review_id: int
    user_id: int
    vote_type: VoteType
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Saved Product Schemas ====================

class SavedProductCreate(BaseModel):
    """Saved product creation schema"""
    product_id: int


class SavedProductResponse(BaseModel):
    """Saved product response schema"""
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True


# ==================== Pagination ====================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    total: int
    skip: int
    limit: int
    items: List


# ==================== Error Schemas ====================

class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    error_code: Optional[str] = None


# Update forward references
ReviewDetailResponse.update_forward_refs()
CommentResponse.update_forward_refs()
