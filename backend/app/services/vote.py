from sqlalchemy.orm import Session
from app.models import Vote, Review
from app.schemas import VoteCreate, VoteType
from fastapi import HTTPException, status


class VoteService:
    """Vote/Helpful service"""
    
    @staticmethod
    def vote_review(db: Session, review_id: int, user_id: int, vote_data: VoteCreate) -> Vote:
        """Vote on a review (upvote/downvote)"""
        # Check if review exists
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Check if user already voted
        existing_vote = db.query(Vote).filter(
            (Vote.review_id == review_id) & (Vote.user_id == user_id)
        ).first()
        
        if existing_vote:
            # Update vote type
            old_vote_type = existing_vote.vote_type
            existing_vote.vote_type = vote_data.vote_type
            
            # Update review helpful/unhelpful counts
            VoteService._update_vote_counts(db, review, old_vote_type, vote_data.vote_type)
            
            db.commit()
            db.refresh(existing_vote)
            return existing_vote
        
        new_vote = Vote(
            review_id=review_id,
            user_id=user_id,
            vote_type=vote_data.vote_type
        )
        
        db.add(new_vote)
        
        # Update review helpful/unhelpful counts
        if vote_data.vote_type == VoteType.UPVOTE:
            review.helpful_count += 1
        else:
            review.unhelpful_count += 1
        
        db.commit()
        db.refresh(new_vote)
        
        return new_vote
    
    @staticmethod
    def get_user_vote(db: Session, review_id: int, user_id: int) -> Vote:
        """Get user's vote on a review"""
        vote = db.query(Vote).filter(
            (Vote.review_id == review_id) & (Vote.user_id == user_id)
        ).first()
        
        if not vote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vote not found"
            )
        
        return vote
    
    @staticmethod
    def remove_vote(db: Session, review_id: int, user_id: int) -> bool:
        """Remove vote from review"""
        vote = db.query(Vote).filter(
            (Vote.review_id == review_id) & (Vote.user_id == user_id)
        ).first()
        
        if not vote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vote not found"
            )
        
        # Update review counts
        review = db.query(Review).filter(Review.id == review_id).first()
        if review:
            if vote.vote_type == VoteType.UPVOTE:
                review.helpful_count = max(0, review.helpful_count - 1)
            else:
                review.unhelpful_count = max(0, review.unhelpful_count - 1)
        
        db.delete(vote)
        db.commit()
        
        return True
    
    @staticmethod
    def _update_vote_counts(db: Session, review: Review, old_vote_type: str, new_vote_type: str):
        """Update review helpful/unhelpful counts when vote changes"""
        if old_vote_type == VoteType.UPVOTE:
            review.helpful_count = max(0, review.helpful_count - 1)
        else:
            review.unhelpful_count = max(0, review.unhelpful_count - 1)
        
        if new_vote_type == VoteType.UPVOTE:
            review.helpful_count += 1
        else:
            review.unhelpful_count += 1
