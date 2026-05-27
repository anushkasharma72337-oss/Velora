from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.models import get_db
from app.schemas import (
    CommentCreate, CommentResponse, CommentUpdate,
    VoteCreate, VoteResponse
)
from app.services import CommentService, VoteService
from app.core import get_current_user

router = APIRouter(prefix="/api", tags=["Comments & Votes"])


# ==================== Comments ====================

@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    review_id: int,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment on a review"""
    comment = CommentService.create_comment(db, review_id, int(current_user["id"]), comment_data)
    return comment


@router.get("/comments/{comment_id}", response_model=CommentResponse)
async def get_comment(comment_id: int, db: Session = Depends(get_db)):
    """Get comment details"""
    comment = CommentService.get_comment_by_id(db, comment_id)
    return comment


@router.get("/reviews/{review_id}/comments", response_model=dict)
async def get_review_comments(
    review_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all comments for a review"""
    result = CommentService.get_review_comments(db, review_id, skip, limit)
    return result


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update comment"""
    comment = CommentService.update_comment(db, comment_id, int(current_user["id"]), comment_data)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete comment"""
    CommentService.delete_comment(db, comment_id, int(current_user["id"]))


@router.post("/comments/{comment_id}/flag", response_model=CommentResponse)
async def flag_comment(
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Flag comment for moderation"""
    comment = CommentService.flag_comment(db, comment_id)
    return comment


# ==================== Votes ====================

@router.post("/votes", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
async def vote_review(
    vote_data: VoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on a review (upvote/downvote)"""
    vote = VoteService.vote_review(db, vote_data.review_id, int(current_user["id"]), vote_data)
    return vote


@router.get("/votes/review/{review_id}", response_model=VoteResponse)
async def get_user_vote(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's vote on a review"""
    vote = VoteService.get_user_vote(db, review_id, int(current_user["id"]))
    return vote


@router.delete("/votes/review/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_vote(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove vote from review"""
    VoteService.remove_vote(db, review_id, int(current_user["id"]))
