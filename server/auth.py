"""
auth.py - Authentication and authorization middleware for YoBot Command Center
"""
import os
import jwt
import logging
import functools
from datetime import datetime, timedelta
from typing import Dict, Any, Callable, Optional

from flask import request, jsonify, g

logger = logging.getLogger("yobot.auth")
logger.setLevel(logging.INFO)

# Get JWT secret from environment variable
JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
if not JWT_SECRET:
    logger.warning("JWT_SECRET_KEY not set. Using default secret (INSECURE)")
    JWT_SECRET = "dev-secret-key-change-in-production"

# Token expiration time (in minutes)
TOKEN_EXPIRATION = int(os.environ.get("TOKEN_EXPIRATION_MINUTES", "60"))

# Role definitions
ROLES = {
    "admin": ["read", "write", "delete", "manage_users"],
    "manager": ["read", "write"],
    "user": ["read"],
}

def generate_token(user_id: str, role: str) -> str:
    """Generate a JWT token for a user."""
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def validate_token(token: str) -> Dict[str, Any]:
    """Validate a JWT token and return the payload."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def get_token_from_request() -> Optional[str]:
    """Extract token from request headers or query parameters."""
    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    
    # Check query parameters
    token = request.args.get("token")
    if token:
        return token
    
    return None

def require_auth(f: Callable) -> Callable:
    """Decorator to require authentication for a route."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        try:
            payload = validate_token(token)
            g.user = payload
        except ValueError as e:
            return jsonify({"error": str(e)}), 401
        
        return f(*args, **kwargs)
    return decorated

def require_role(required_role: str) -> Callable:
    """Decorator to require a specific role for a route."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        @require_auth
        def decorated(*args, **kwargs):
            user_role = g.user.get("role")
            
            # Check if user has the required role
            if user_role == required_role or user_role == "admin":
                return f(*args, **kwargs)
            
            return jsonify({"error": "Insufficient permissions"}), 403
        return decorated
    return decorator

def require_permission(required_permission: str) -> Callable:
    """Decorator to require a specific permission for a route."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        @require_auth
        def decorated(*args, **kwargs):
            user_role = g.user.get("role")
            
            # Check if user's role has the required permission
            if user_role in ROLES and required_permission in ROLES[user_role]:
                return f(*args, **kwargs)
            
            return jsonify({"error": "Insufficient permissions"}), 403
        return decorated
    return decorator

def init_auth(app):
    """Initialize authentication for the Flask app."""
    @app.route("/api/auth/login", methods=["POST"])
    def login():
        data = request.get_json(force=True)
        username = data.get("username")
        password = data.get("password")
        
        # TODO: Replace with actual user authentication logic
        # This is just a placeholder for demonstration
        if username == "admin" and password == "password":
            token = generate_token(username, "admin")
            return jsonify({"token": token, "user": {"username": username, "role": "admin"}})
        elif username == "user" and password == "password":
            token = generate_token(username, "user")
            return jsonify({"token": token, "user": {"username": username, "role": "user"}})
        
        return jsonify({"error": "Invalid credentials"}), 401
    
    @app.route("/api/auth/verify", methods=["GET"])
    @require_auth
    def verify_token():
        return jsonify({"valid": True, "user": g.user})
    
    logger.info("Authentication routes initialized")