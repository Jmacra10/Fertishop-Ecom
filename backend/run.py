import os
import subprocess

def main():
    """
    Helper script to run the Flask application.
    
    This will:
    1. Check if the database exists, if not initialize it
    2. Start the Flask application
    """
    # Check if database exists
    if not os.path.exists('fertishop.db'):
        print("Initializing database...")
        try:
            subprocess.run(["python", "init_db.py"], check=True)
        except subprocess.CalledProcessError:
            print("Error initializing database!")
            return
    
    # Start Flask app
    print("Starting Flask application...")
    from app import app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == "__main__":
    main() 