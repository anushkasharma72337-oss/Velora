from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.models import get_db, Comment, User
from app.core import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/comments/flagged", response_model=dict)
async def get_flagged_comments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get flagged comments (admin only)"""
    # Verify admin role
    user = db.query(User).filter(User.id == int(current_user["id"])).first()
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    query = db.query(Comment).filter(Comment.is_flagged == True)
    total = query.count()
    comments = query.offset(skip).limit(limit).all()
    
    return {"total": total, "skip": skip, "limit": limit, "items": comments}


@router.put("/comments/{comment_id}/unflag")
async def unflag_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unflag a comment (admin only)"""
    # Verify admin role
    user = db.query(User).filter(User.id == int(current_user["id"])).first()
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    comment.is_flagged = False
    db.commit()
    db.refresh(comment)
    
    return {"message": "Comment unflagged"}


@router.delete("/comments/{comment_id}")
async def delete_comment_admin(
    comment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete comment (admin only)"""
    # Verify admin role
    user = db.query(User).filter(User.id == int(current_user["id"])).first()
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted"}


@router.put("/products/{product_id}/feature")
async def feature_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Feature a product (admin only)"""
    from app.models import Product
    
    # Verify admin role
    user = db.query(User).filter(User.id == int(current_user["id"])).first()
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.is_featured = True
    db.commit()
    db.refresh(product)
    
    return {"message": "Product featured"}


@router.put("/products/{product_id}/unfeature")
async def unfeature_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfeature a product (admin only)"""
    from app.models import Product
    
    # Verify admin role
    user = db.query(User).filter(User.id == int(current_user["id"])).first()
    if not user or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.is_featured = False
    db.commit()
    db.refresh(product)
    
    return {"message": "Product unfeatured"}
