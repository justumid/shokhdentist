"""Error handlers and custom exceptions"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from logger import logger
from typing import Union
import traceback

class AppException(Exception):
    """Base application exception"""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ValidationException(AppException):
    """Validation error"""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, 400, details)

class AuthenticationException(AppException):
    """Authentication error"""
    def __init__(self, message: str = "Invalid authentication"):
        super().__init__(message, 401)

class AuthorizationException(AppException):
    """Authorization error"""
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, 403)

class NotFoundException(AppException):
    """Resource not found"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404)

class ConflictException(AppException):
    """Resource conflict"""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, 409, details)

async def app_exception_handler(request: Request, exc: AppException):
    """Handler for custom app exceptions"""
    logger.error(f"Application error: {exc.message}", extra={
        "status_code": exc.status_code,
        "path": request.url.path,
        "details": exc.details
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "timestamp": logger.handlers[0].formatter.formatTime(logger.makeRecord(
                logger.name, 0, "", 0, "", (), None
            ))
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handler for HTTP exceptions"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}", extra={
        "path": request.url.path,
        "method": request.method
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for validation errors"""
    logger.warning("Validation error", extra={
        "path": request.url.path,
        "errors": exc.errors()
    })
    
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation error",
            "details": exc.errors()
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", extra={
        "path": request.url.path,
        "traceback": traceback.format_exc()
    })
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred" if not logger.isEnabledFor(10) else str(exc)
        }
    )
