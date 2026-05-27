from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Product, ProductCategory, Review, SavedProduct
from app.schemas import ProductCreate, ProductUpdate
from fastapi import HTTPException, status


class ProductService:
    """Product service"""
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate, owner_id: int) -> Product:
        """Create a new product"""
        # Check if slug already exists
        existing = db.query(Product).filter(Product.slug == product_data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this slug already exists"
            )
        
        # Check if category exists
        category = db.query(ProductCategory).filter(ProductCategory.id == product_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        new_product = Product(
            name=product_data.name,
            slug=product_data.slug,
            description=product_data.description,
            logo_url=product_data.logo_url,
            website_url=product_data.website_url,
            category_id=product_data.category_id,
            owner_id=owner_id
        )
        
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        
        return new_product
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Product:
        """Get product by ID"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return product
    
    @staticmethod
    def get_product_by_slug(db: Session, slug: str) -> Product:
        """Get product by slug"""
        product = db.query(Product).filter(Product.slug == slug).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return product
    
    @staticmethod
    def get_all_products(db: Session, skip: int = 0, limit: int = 10, category_id: int = None):
        """Get all products with pagination and filtering"""
        query = db.query(Product).filter(Product.is_published == True)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        total = query.count()
        products = query.offset(skip).limit(limit).all()
        
        return {"total": total, "skip": skip, "limit": limit, "items": products}
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate, owner_id: int) -> Product:
        """Update product"""
        product = ProductService.get_product_by_id(db, product_id)
        
        # Check ownership
        if product.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this product"
            )
        
        update_data = product_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int, owner_id: int) -> bool:
        """Delete product"""
        product = ProductService.get_product_by_id(db, product_id)
        
        # Check ownership
        if product.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this product"
            )
        
        db.delete(product)
        db.commit()
        
        return True
    
    @staticmethod
    def save_product(db: Session, product_id: int, user_id: int) -> SavedProduct:
        """Save/bookmark a product"""
        # Check if already saved
        saved = db.query(SavedProduct).filter(
            (SavedProduct.product_id == product_id) & (SavedProduct.user_id == user_id)
        ).first()
        
        if saved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product already saved"
            )
        
        new_saved = SavedProduct(product_id=product_id, user_id=user_id)
        db.add(new_saved)
        db.commit()
        db.refresh(new_saved)
        
        return new_saved
    
    @staticmethod
    def unsave_product(db: Session, product_id: int, user_id: int) -> bool:
        """Remove saved product"""
        saved = db.query(SavedProduct).filter(
            (SavedProduct.product_id == product_id) & (SavedProduct.user_id == user_id)
        ).first()
        
        if not saved:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved product not found"
            )
        
        db.delete(saved)
        db.commit()
        
        return True
    
    @staticmethod
    def get_saved_products(db: Session, user_id: int, skip: int = 0, limit: int = 10):
        """Get user's saved products"""
        query = db.query(SavedProduct).filter(SavedProduct.user_id == user_id)
        total = query.count()
        saved = query.offset(skip).limit(limit).all()
        
        return {"total": total, "skip": skip, "limit": limit, "items": saved}
