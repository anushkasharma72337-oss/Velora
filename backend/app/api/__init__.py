from fastapi import APIRouter
from app.api.routes import auth_router, product_router, review_router, comment_vote_router, admin_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(product_router)
api_router.include_router(review_router)
api_router.include_router(comment_vote_router)
api_router.include_router(admin_router)

__all__ = ["api_router"]
