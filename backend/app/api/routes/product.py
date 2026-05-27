from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.models import get_db
from app.schemas import (
    ProductCategoryCreate, ProductCategoryResponse,
    ProductCreate, ProductResponse, ProductDetailResponse,
    ProductUpdate, SavedProductResponse
)
from app.services import ProductService
from app.core import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])


# ==================== Categories ====================

@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: ProductCategoryCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product category (admin only)"""
    from app.models import ProductCategory
    
    new_category = ProductCategory(
        name=category_data.name,
        slug=category_data.slug,
        description=category_data.description,
        icon=category_data.icon
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category


@router.get("/categories", response_model=list[ProductCategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    from app.models import ProductCategory
    
    categories = db.query(ProductCategory).all()
    return categories


@router.get("/categories/{category_id}", response_model=ProductCategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID"""
    from app.models import ProductCategory
    
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


# ==================== Products ====================

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    product = ProductService.create_product(db, product_data, int(current_user["id"]))
    return product


@router.get("/", response_model=dict)
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get all published products"""
    result = ProductService.get_all_products(db, skip, limit, category_id)
    return result


@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product details"""
    product = ProductService.get_product_by_id(db, product_id)
    return product


@router.get("/slug/{slug}", response_model=ProductDetailResponse)
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get product by slug"""
    product = ProductService.get_product_by_slug(db, slug)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update product"""
    product = ProductService.update_product(db, product_id, product_data, int(current_user["id"]))
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete product"""
    ProductService.delete_product(db, product_id, int(current_user["id"]))


# ==================== Saved Products ====================

@router.post("/{product_id}/save", response_model=SavedProductResponse, status_code=status.HTTP_201_CREATED)
async def save_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save/bookmark a product"""
    saved = ProductService.save_product(db, product_id, int(current_user["id"]))
    return saved


@router.delete("/{product_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove saved product"""
    ProductService.unsave_product(db, product_id, int(current_user["id"]))


@router.get("/saved", response_model=dict)
async def get_saved_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved products"""
    result = ProductService.get_saved_products(db, int(current_user["id"]), skip, limit)
    return result
