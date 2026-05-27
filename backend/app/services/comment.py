from sqlalchemy.orm import Session
from app.models import Comment, Review
from app.schemas import CommentCreate, CommentUpdate
from fastapi import HTTPException, status


class CommentService:
    """Comment service"""
    
    @staticmethod
    def create_comment(db: Session, review_id: int, author_id: int, comment_data: CommentCreate) -> Comment:
        """Create a new comment"""
        # Check if review exists
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        new_comment = Comment(
            review_id=review_id,
            author_id=author_id,
            content=comment_data.content
        )
        
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        
        return new_comment
    
    @staticmethod
    def get_comment_by_id(db: Session, comment_id: int) -> Comment:
        """Get comment by ID"""
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        return comment
    
    @staticmethod
    def get_review_comments(db: Session, review_id: int, skip: int = 0, limit: int = 10):
        """Get all comments for a review"""
        query = db.query(Comment).filter(Comment.review_id == review_id)
        total = query.count()
        comments = query.offset(skip).limit(limit).all()
        
        return {"total": total, "skip": skip, "limit": limit, "items": comments}
    
    @staticmethod
    def update_comment(db: Session, comment_id: int, author_id: int, comment_data: CommentUpdate) -> Comment:
        """Update comment"""
        comment = CommentService.get_comment_by_id(db, comment_id)
        
        # Check ownership
        if comment.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this comment"
            )
        
        comment.content = comment_data.content
        db.commit()
        db.refresh(comment)
        
        return comment
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, author_id: int) -> bool:
        """Delete comment"""
        comment = CommentService.get_comment_by_id(db, comment_id)
        
        # Check ownership
        if comment.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this comment"
            )
        
        db.delete(comment)
        db.commit()
        
        return True
    
    @staticmethod
    def flag_comment(db: Session, comment_id: int) -> Comment:
        """Flag comment for moderation"""
        comment = CommentService.get_comment_by_id(db, comment_id)
        comment.is_flagged = True
        db.commit()
        db.refresh(comment)
        
        return comment
