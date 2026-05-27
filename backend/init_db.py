"""Database initialization script"""
from app.models import Base, engine, SessionLocal, ProductCategory, User
from app.core import SecurityUtils
from app.models import UserRole
import logging

logger = logging.getLogger(__name__)


def init_db():
    """Initialize database with tables and seed data"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Add seed data
    db = SessionLocal()
    
    try:
        # Create categories if they don't exist
        if db.query(ProductCategory).count() == 0:
            categories = [
                ProductCategory(
                    name="SaaS",
                    slug="saas",
                    description="Software as a Service products"
                ),
                ProductCategory(
                    name="Mobile",
                    slug="mobile",
                    description="Mobile applications"
                ),
                ProductCategory(
                    name="Web",
                    slug="web",
                    description="Web applications"
                ),
                ProductCategory(
                    name="AI/ML",
                    slug="ai-ml",
                    description="Artificial Intelligence and Machine Learning"
                ),
                ProductCategory(
                    name="API",
                    slug="api",
                    description="API services and integrations"
                ),
                ProductCategory(
                    name="Dev Tools",
                    slug="dev-tools",
                    description="Developer tools and utilities"
                ),
            ]
            
            for category in categories:
                db.add(category)
            
            db.commit()
            logger.info("Product categories created")
        
        # Create admin user if it doesn't exist
        if db.query(User).filter(User.email == "admin@example.com").first() is None:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=SecurityUtils.hash_password("admin123"),
                full_name="Admin User",
                role=UserRole.ADMIN,
                is_verified=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Admin user created")
        
        logger.info("Database initialization complete!")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import logging.config
    
    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            },
        },
        "handlers": {
            "default": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "standard",
            },
        },
        "loggers": {
            "": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": True
            }
        }
    })
    
    init_db()
