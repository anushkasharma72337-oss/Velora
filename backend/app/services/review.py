from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Review, Rating, Product
from app.schemas import ReviewCreate, ReviewUpdate
from fastapi import HTTPException, status


class ReviewService:
    """Review service"""
    
    @staticmethod
    def create_review(db: Session, product_id: int, reviewer_id: int, review_data: ReviewCreate) -> Review:
        """Create a new review"""
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        new_review = Review(
            product_id=product_id,
            reviewer_id=reviewer_id,
            title=review_data.title,
            content=review_data.content,
            rating=review_data.rating
        )
        
        db.add(new_review)
        
        # Update product average rating
        ReviewService._update_product_rating(db, product_id)
        
        db.commit()
        db.refresh(new_review)
        
        return new_review
    
    @staticmethod
    def get_review_by_id(db: Session, review_id: int) -> Review:
        """Get review by ID"""
        review = db.query(Review).filter(Review.id == review_id).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        return review
    
    @staticmethod
    def get_product_reviews(db: Session, product_id: int, skip: int = 0, limit: int = 10):
        """Get all reviews for a product"""
        query = db.query(Review).filter(Review.product_id == product_id)
        total = query.count()
        reviews = query.offset(skip).limit(limit).all()
        
        return {"total": total, "skip": skip, "limit": limit, "items": reviews}
    
    @staticmethod
    def update_review(db: Session, review_id: int, reviewer_id: int, review_data: ReviewUpdate) -> Review:
        """Update review"""
        review = ReviewService.get_review_by_id(db, review_id)
        
        # Check ownership
        if review.reviewer_id != reviewer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this review"
            )
        
        update_data = review_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(review, key, value)
        
        # Update product rating if rating changed
        ReviewService._update_product_rating(db, review.product_id)
        
        db.commit()
        db.refresh(review)
        
        return review
    
    @staticmethod
    def delete_review(db: Session, review_id: int, reviewer_id: int) -> bool:
        """Delete review"""
        review = ReviewService.get_review_by_id(db, review_id)
        
        # Check ownership
        if review.reviewer_id != reviewer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this review"
            )
        
        product_id = review.product_id
        db.delete(review)
        
        # Update product rating
        ReviewService._update_product_rating(db, product_id)
        
        db.commit()
        
        return True
    
    @staticmethod
    def _update_product_rating(db: Session, product_id: int):
        """Update product average rating"""
        result = db.query(
            func.avg(Review.rating).label('avg_rating'),
            func.count(Review.id).label('review_count')
        ).filter(Review.product_id == product_id).first()
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.average_rating = float(result.avg_rating) if result.avg_rating else 0.0
            product.review_count = result.review_count or 0


class RatingService:
    """Rating service"""
    
    @staticmethod
    def rate_product(db: Session, product_id: int, user_id: int, score: int) -> Rating:
        """Rate a product"""
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if user already rated
        existing_rating = db.query(Rating).filter(
            (Rating.product_id == product_id) & (Rating.user_id == user_id)
        ).first()
        
        if existing_rating:
            existing_rating.score = score
            db.commit()
            db.refresh(existing_rating)
            return existing_rating
        
        new_rating = Rating(
            product_id=product_id,
            user_id=user_id,
            score=score
        )
        
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        
        return new_rating
    
    @staticmethod
    def get_user_rating(db: Session, product_id: int, user_id: int) -> Rating:
        """Get user's rating for a product"""
        rating = db.query(Rating).filter(
            (Rating.product_id == product_id) & (Rating.user_id == user_id)
        ).first()
        
        if not rating:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rating not found"
            )
        
        return rating
    
    @staticmethod
    def delete_rating(db: Session, product_id: int, user_id: int) -> bool:
        """Delete rating"""
        rating = db.query(Rating).filter(
            (Rating.product_id == product_id) & (Rating.user_id == user_id)
        ).first()
        
        if not rating:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rating not found"
            )
        
        db.delete(rating)
        db.commit()
        
        return True
