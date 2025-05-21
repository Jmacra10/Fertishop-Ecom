import sqlite3
import os
import sys

# Add the current directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth import hash_password
from models import Database, User

def create_test_user():
    print("Initializing database and creating test user...")
    
    # Initialize DB
    db = Database()
    user_model = User(db)
    
    # Check if test user already exists
    test_email = "test@example.com"
    existing_user = user_model.get_by_email(test_email)
    
    if existing_user:
        print(f"Test user already exists with email: {test_email}")
    else:
        # Create a test user
        raw_password = "testpassword"
        hashed_password = hash_password(raw_password)
        
        user = user_model.create("Test User", test_email, hashed_password)
        
        if user:
            print(f"Test user created successfully with email: {test_email} and password: {raw_password}")
        else:
            print("Failed to create test user")
    
    # Also add a demo user for easy login
    demo_email = "demo@example.com"
    demo_user = user_model.get_by_email(demo_email)
    
    if demo_user:
        print(f"Demo user already exists with email: {demo_email}")
    else:
        demo_password = "password"
        hashed_demo_password = hash_password(demo_password)
        
        demo = user_model.create("Demo User", demo_email, hashed_demo_password)
        
        if demo:
            print(f"Demo user created successfully with email: {demo_email} and password: {demo_password}")
        else:
            print("Failed to create demo user")
    
    db.close_connection()
    print("Database initialization complete")

if __name__ == "__main__":
    create_test_user() 