# FertiShop Backend

This is the Python backend for the FertiShop e-commerce application, built with Flask and SQLite.

## Setup Instructions

1. Make sure you have Python 3.8+ installed

2. Install the required dependencies:
```
pip install -r requirements.txt
```

3. Initialize the database:
```
python init_db.py
```

4. Run the application:
```
python run.py
```

The API will be available at `http://127.0.0.1:5000`

## Features

- RESTful API for the FertiShop e-commerce application
- User authentication with JWT
- Product catalog management
- Shopping cart functionality
- Order processing
- SQLite database for easy deployment

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register a new user
- `GET /api/auth/me` - Get the current user's details

### Product Endpoints

- `GET /api/products` - Get all products with optional filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/{id}` - Get a specific product
- `GET /api/products/{id}/related` - Get related products

### Category Endpoints

- `GET /api/categories` - Get all categories

### Use Case Endpoints

- `GET /api/usecases` - Get all use cases

### Cart Endpoints

- `GET /api/cart` - Get the current user's cart
- `POST /api/cart/add` - Add a product to the cart
- `PUT /api/cart/update` - Update a product quantity in the cart
- `DELETE /api/cart/remove` - Remove a product from the cart
- `DELETE /api/cart/clear` - Clear the cart

### Order Endpoints

- `GET /api/orders` - Get all orders for the current user
- `GET /api/orders/{id}` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/{id}/status` - Update an order's status

## Demo User

For testing, a demo user is created:
- Email: demo@example.com
- Password: password 