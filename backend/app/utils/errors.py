"""Error handling and exceptions"""
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class ResourceNotFoundError(AppException):
    """Resource not found error"""
    
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", status.HTTP_404_NOT_FOUND)


class UnauthorizedError(AppException):
    """Unauthorized error"""
    
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(detail, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppException):
    """Forbidden error"""
    
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(detail, status.HTTP_403_FORBIDDEN)


class ConflictError(AppException):
    """Resource conflict error"""
    
    def __init__(self, detail: str):
        super().__init__(detail, status.HTTP_409_CONFLICT)


class ValidationError(AppException):
    """Validation error"""
    
    def __init__(self, detail: str):
        super().__init__(detail, status.HTTP_422_UNPROCESSABLE_ENTITY)
