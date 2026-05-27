from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum
from app.core.config import get_settings

settings = get_settings()

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


class UserRole(str, enum.Enum):
    """User role enum"""
    USER = "user"
    FOUNDER = "founder"
    ADMIN = "admin"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="owner", foreign_keys="Product.owner_id")
    reviews = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    ratings = relationship("Rating", back_populates="user", foreign_keys="Rating.user_id")
    comments = relationship("Comment", back_populates="author", foreign_keys="Comment.author_id")
    votes = relationship("Vote", back_populates="user", foreign_keys="Vote.user_id")
    saved_products = relationship("SavedProduct", back_populates="user", foreign_keys="SavedProduct.user_id")


class ProductCategory(Base):
    """Product category model"""
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    """Product model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("product_categories.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="products", foreign_keys=[owner_id])
    category = relationship("ProductCategory", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="product", cascade="all, delete-orphan")
    saved_by = relationship("SavedProduct", back_populates="product", cascade="all, delete-orphan")


class Review(Base):
    """Review model"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    unhelpful_count = Column(Integer, default=0, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="reviews", foreign_keys=[product_id])
    reviewer = relationship("User", back_populates="reviews", foreign_keys=[reviewer_id])
    comments = relationship("Comment", back_populates="review", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="review", cascade="all, delete-orphan")


class Rating(Base):
    """Rating model - separate from reviews for flexibility"""
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint('product_id', 'user_id', name='unique_product_user_rating'),)
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)  # 1-5
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="ratings", foreign_keys=[product_id])
    user = relationship("User", back_populates="ratings", foreign_keys=[user_id])


class Comment(Base):
    """Comment model"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_flagged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    review = relationship("Review", back_populates="comments", foreign_keys=[review_id])
    author = relationship("User", back_populates="comments", foreign_keys=[author_id])


class VoteType(str, enum.Enum):
    """Vote type enum"""
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class Vote(Base):
    """Vote/Helpful model"""
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint('review_id', 'user_id', name='unique_review_user_vote'),)
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vote_type = Column(SQLEnum(VoteType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    review = relationship("Review", back_populates="votes", foreign_keys=[review_id])
    user = relationship("User", back_populates="votes", foreign_keys=[user_id])


class SavedProduct(Base):
    """Saved/Bookmarked products model"""
    __tablename__ = "saved_products"
    __table_args__ = (UniqueConstraint('user_id', 'product_id', name='unique_user_saved_product'),)
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="saved_products", foreign_keys=[user_id])
    product = relationship("Product", back_populates="saved_by", foreign_keys=[product_id])


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
