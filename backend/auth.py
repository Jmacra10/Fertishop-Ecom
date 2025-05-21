import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Use an environment variable for the secret key or create a default one
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fertishop-super-secret-key")
TOKEN_EXPIRY = 24 * 60 * 60  # 24 hours in seconds


def hash_password(password):
    """
    Hash a password for storing
    """
    # Generate a salt
    salt = bcrypt.gensalt()
    # Hash the password with the salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Return the hashed password as a string
    return hashed.decode('utf-8')


def verify_password(hashed_password, password):
    """
    Verify a stored password against a provided password
    """
    # Convert string to bytes if needed
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    # Verify the password against the hash
    try:
        return bcrypt.checkpw(password, hashed_password)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False


def create_access_token(payload):
    """
    Create a JWT token
    """
    # Set expiry time
    expiry = datetime.utcnow() + timedelta(seconds=TOKEN_EXPIRY)
    
    # Add expiry time to payload
    token_payload = {
        **payload,
        'exp': expiry
    }
    
    # Create token
    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
    
    # Return token as string
    return token


def decode_token(token):
    """
    Decode and verify JWT token
    """
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        # Invalid token
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        # Other errors
        print(f"Error decoding token: {e}")
        return None 