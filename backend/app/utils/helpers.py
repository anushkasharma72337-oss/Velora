"""Utility functions and helpers"""
from typing import Optional
import re


def slugify(text: str) -> str:
    """Convert text to slug format"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def paginate_query(query, skip: int = 0, limit: int = 10):
    """Apply pagination to a query"""
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }
