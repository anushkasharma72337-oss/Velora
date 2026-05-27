from .auth import router as auth_router
from .product import router as product_router
from .review import router as review_router
from .comment_vote import router as comment_vote_router
from .admin import router as admin_router

__all__ = ["auth_router", "product_router", "review_router", "comment_vote_router", "admin_router"]
