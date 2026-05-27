from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.models import get_db
from app.schemas import (
    ReviewCreate, ReviewResponse, ReviewDetailResponse, ReviewUpdate,
    RatingCreate, RatingResponse
)
from app.services import ReviewService, RatingService
from app.core import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


# ==================== Reviews ====================

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new review"""
    review = ReviewService.create_review(db, product_id, int(current_user["id"]), review_data)
    return review


@router.get("/{review_id}", response_model=ReviewDetailResponse)
async def get_review(review_id: int, db: Session = Depends(get_db)):
    """Get review details"""
    review = ReviewService.get_review_by_id(db, review_id)
    return review


@router.get("/product/{product_id}", response_model=dict)
async def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all reviews for a product"""
    result = ReviewService.get_product_reviews(db, product_id, skip, limit)
    return result


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update review"""
    review = ReviewService.update_review(db, review_id, int(current_user["id"]), review_data)
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete review"""
    ReviewService.delete_review(db, review_id, int(current_user["id"]))


# ==================== Ratings ====================

@router.post("/rating", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def rate_product(
    rating_data: RatingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rate a product"""
    from app.schemas import RatingCreate as RatingCreateSchema
    
    rating = RatingService.rate_product(
        db,
        rating_data.product_id,
        int(current_user["id"]),
        rating_data.score
    )
    return rating


@router.get("/rating/{product_id}", response_model=RatingResponse)
async def get_user_rating(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's rating for a product"""
    rating = RatingService.get_user_rating(db, product_id, int(current_user["id"]))
    return rating


@router.delete("/rating/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rating(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete rating"""
    RatingService.delete_rating(db, product_id, int(current_user["id"]))
