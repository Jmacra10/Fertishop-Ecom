from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import os
from functools import wraps
from datetime import datetime

from models import Database, User, Category, Product, UseCase, Order, Cart
from auth import hash_password, verify_password, create_access_token, decode_token

app = Flask(__name__)

# Configure CORS to allow any origin during development
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
     expose_headers=["Access-Control-Allow-Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    if request.method == 'OPTIONS':
        # Handle preflight requests
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Max-Age'] = '3600'  # Cache preflight response for 1 hour
    return response

# Initialize database
db = Database()

# Initialize models
user_model = User(db)
category_model = Category(db)
product_model = Product(db)
use_case_model = UseCase(db)
order_model = Order(db)
cart_model = Cart(db)

# Helper function to extract user ID from JWT token
def get_user_from_token(token):
    if not token:
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    return user_model.get_by_id(payload.get("sub"))

# Authentication middleware
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            print("Auth error: No authorization header provided")
            return jsonify({"error": "No authorization header provided"}), 401
        
        try:
            # Extract token from header
            token = auth_header.split("Bearer ")[-1]
            if not token:
                print("Auth error: Empty token")
                return jsonify({"error": "Empty token"}), 401
                
            # Get user from token
            user = get_user_from_token(token)
            
            if not user:
                print(f"Auth error: Invalid or expired token: {token[:10]}...")
                return jsonify({"error": "Invalid or expired token"}), 401
            
            # Add user to request
            request.user = user
            request.user_id = user["id"]
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Auth error: {str(e)}")
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401
    
    return decorated_function

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

# Auth endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request format"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = user_model.get_by_email(email)
        
        if not user:
            print(f"Login failed: User with email {email} not found")
            # Use a generic message to prevent email enumeration
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Debug password verification
        print(f"Attempting to verify password for {email}")
        stored_password = user["password"]
        
        # Verify password
        password_valid = verify_password(stored_password, password)
        if not password_valid:
            print(f"Login failed: Invalid password for {email}")
            return jsonify({"error": "Invalid credentials"}), 401
        
        print(f"Login successful for {email}")
        
        # Create access token
        token = create_access_token({"sub": user["id"]})
        
        response = jsonify({
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        })
        
        # Set cookie with token for client-side storage
        response.set_cookie(
            'auth_token', 
            token, 
            httponly=True, 
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            max_age=24*60*60  # 24 hours
        )
        
        return response
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Server error during login. Please try again."}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    
    # Check if user already exists
    if user_model.get_by_email(email):
        return jsonify({"error": "Email already registered"}), 400
    
    # Hash password and create user
    hashed_password = hash_password(password)
    user = user_model.create(name, email, hashed_password)
    
    if not user:
        return jsonify({"error": "Error creating user"}), 500
    
    # Create access token
    token = create_access_token({"sub": user["id"]})
    
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 201

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_me():
    return jsonify({
        "user": {
            "id": request.user["id"],
            "name": request.user["name"],
            "email": request.user["email"]
        }
    })

# Categories endpoints
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = category_model.get_all()
    return jsonify({"categories": categories})

# Products endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        category = request.args.get('category')
        use_case = request.args.get('useCase')
        search = request.args.get('search')
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        products = product_model.get_all(
            limit=limit,
            offset=offset,
            category_slug=category,
            use_case_slug=use_case,
            search=search
        )
        
        # Format response to match frontend expectations
        formatted_products = []
        for product in products:
            # Make sure image is always defined to prevent client errors
            image = product.get("image") or "/placeholder.svg"
            
            formatted_products.append({
                "id": str(product["id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "category": product["category_slug"],
                "useCase": [uc["slug"] for uc in product["use_cases"]],
                "image": image,
                "soldCount": product["sold_count"],
                "stock": product["stock"],
                "treatmentFor": product["treatment_for"]
            })
        
        return jsonify({"products": formatted_products})
    except Exception as e:
        print(f"Error getting products: {e}")
        return jsonify({"products": [], "error": str(e)})

@app.route('/api/products/featured', methods=['GET'])
def get_featured_products():
    try:
        limit = request.args.get('limit', default=6, type=int)
        products = product_model.get_featured(limit=limit)
        
        # Format response to match frontend expectations
        formatted_products = []
        for product in products:
            # Make sure image is always defined to prevent client errors
            image = product.get("image") or "/placeholder.svg"
            
            formatted_products.append({
                "id": str(product["id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "category": product["category_slug"],
                "useCase": [uc["slug"] for uc in product["use_cases"]],
                "image": image,
                "soldCount": product["sold_count"],
                "stock": product["stock"],
                "treatmentFor": product["treatment_for"]
            })
        
        return jsonify({"products": formatted_products})
    except Exception as e:
        print(f"Error getting featured products: {e}")
        return jsonify({"products": [], "error": str(e)})

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = product_model.get_by_id(product_id)
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Make sure image is always defined to prevent client errors
        image = product.get("image") or "/placeholder.svg"
        
        # Format response to match frontend expectations
        formatted_product = {
            "id": str(product["id"]),
            "name": product["name"],
            "description": product["description"],
            "price": product["price"],
            "category": product["category_slug"],
            "useCase": [uc["slug"] for uc in product["use_cases"]],
            "image": image,
            "soldCount": product["sold_count"],
            "stock": product["stock"],
            "treatmentFor": product["treatment_for"]
        }
        
        return jsonify({"product": formatted_product})
    except Exception as e:
        print(f"Error getting product: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<product_id>/related', methods=['GET'])
def get_related_products(product_id):
    try:
        limit = request.args.get('limit', default=4, type=int)
        products = product_model.get_related(product_id, limit=limit)
        
        # Format response to match frontend expectations
        formatted_products = []
        for product in products:
            # Make sure image is always defined to prevent client errors
            image = product.get("image") or "/placeholder.svg"
            
            formatted_products.append({
                "id": str(product["id"]),
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "category": product["category_slug"],
                "useCase": [uc["slug"] for uc in product["use_cases"]],
                "image": image,
                "soldCount": product["sold_count"],
                "stock": product["stock"],
                "treatmentFor": product["treatment_for"]
            })
        
        return jsonify({"products": formatted_products})
    except Exception as e:
        print(f"Error getting related products: {e}")
        return jsonify({"products": [], "error": str(e)})

# Use Cases endpoints
@app.route('/api/usecases', methods=['GET'])
def get_use_cases():
    use_cases = use_case_model.get_all()
    return jsonify({"useCases": use_cases})

# Cart endpoints
@app.route('/api/cart', methods=['GET'])
@login_required
def get_cart():
    try:
        items = cart_model.get_items(request.user_id)
        
        # Format response to match frontend expectations
        formatted_items = []
        for item in items:
            # Make sure image is always defined to prevent client errors
            image = item.get("image") or "/placeholder.svg"
            
            formatted_items.append({
                "id": str(item["product_id"]),
                "name": item["name"],
                "price": item["price"],
                "quantity": item["quantity"],
                "image": image,
                "stock": item["stock"]
            })
        
        return jsonify({"items": formatted_items})
    except Exception as e:
        print(f"Error getting cart: {e}")
        return jsonify({"items": [], "error": str(e)})

@app.route('/api/cart/add', methods=['POST'])
@login_required
def add_to_cart():
    data = request.json
    
    # Handle prod-X format as well as numeric IDs
    product_id_raw = data.get('productId')
    quantity = data.get('quantity', 1)
    
    # Validate input
    if not product_id_raw:
        return jsonify({"error": "Product ID is required"}), 400
    
    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "Quantity must be a positive integer"}), 400
    
    try:
        # Handle prod-X format and regular numeric IDs
        product_id = None
        if isinstance(product_id_raw, str) and product_id_raw.startswith('prod-'):
            product_id = int(product_id_raw.replace('prod-', ''))
        else:
            product_id = int(product_id_raw)
    except (ValueError, TypeError):
        return jsonify({"error": f"Invalid product ID format: {product_id_raw}"}), 400
    
    # Check if product exists
    product = product_model.get_by_id(product_id)
    if not product:
        return jsonify({"error": f"Product with ID {product_id} not found"}), 404
    
    # Add to cart
    try:
        print(f"Adding product ID {product_id} to cart for user {request.user_id}")
        cart_model.add_item(request.user_id, product_id, quantity)
        return jsonify({
            "message": "Product added to cart",
            "productId": f"prod-{product_id}",
            "quantity": quantity
        })
    except Exception as e:
        print(f"Error adding product {product_id} to cart: {str(e)}")
        return jsonify({"error": f"Error adding product to cart: {str(e)}"}), 500

@app.route('/api/cart/update', methods=['PUT'])
@login_required
def update_cart_item():
    data = request.json
    product_id_raw = data.get('productId')
    quantity = data.get('quantity')
    
    if not product_id_raw or quantity is None:
        return jsonify({"error": "Product ID and quantity are required"}), 400
    
    # Handle different product ID formats
    try:
        # Check if product_id is a string prefixed with 'prod-'
        if isinstance(product_id_raw, str) and product_id_raw.startswith('prod-'):
            product_id = int(product_id_raw.replace('prod-', ''))
        else:
            product_id = int(product_id_raw)
    except (ValueError, TypeError):
        return jsonify({"error": f"Invalid product ID format: {product_id_raw}"}), 400
    
    # If quantity is 0, remove from cart
    if quantity <= 0:
        success = cart_model.remove_item(request.user_id, product_id)
    else:
        # Check if product exists and has enough stock
        product = product_model.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        if product["stock"] < quantity:
            return jsonify({"error": "Not enough stock available"}), 400
        
        success = cart_model.update_quantity(request.user_id, product_id, quantity)
    
    if success:
        return jsonify({"message": "Cart updated"})
    else:
        return jsonify({"error": "Error updating cart"}), 500

@app.route('/api/cart/remove', methods=['DELETE'])
@login_required
def remove_from_cart():
    product_id_raw = request.args.get('productId')
    
    if not product_id_raw:
        return jsonify({"error": "Product ID is required"}), 400
    
    # Handle different product ID formats
    try:
        # Check if product_id is a string prefixed with 'prod-'
        if isinstance(product_id_raw, str) and product_id_raw.startswith('prod-'):
            product_id = int(product_id_raw.replace('prod-', ''))
        else:
            product_id = int(product_id_raw)
    except (ValueError, TypeError):
        return jsonify({"error": f"Invalid product ID format: {product_id_raw}"}), 400
    
    success = cart_model.remove_item(request.user_id, product_id)
    
    if success:
        return jsonify({"message": "Product removed from cart"})
    else:
        return jsonify({"error": "Error removing product from cart"}), 500

@app.route('/api/cart/clear', methods=['DELETE'])
@login_required
def clear_cart():
    success = cart_model.clear(request.user_id)
    
    if success:
        return jsonify({"message": "Cart cleared"})
    else:
        return jsonify({"message": "Cart was already empty"})

# Orders endpoints
@app.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    orders = order_model.get_user_orders(request.user_id)
    
    # Format response to match frontend expectations
    formatted_orders = []
    for order in orders:
        formatted_items = []
        for item in order["items"]:
            # Make sure image is always defined
            image = item.get("image") or "/placeholder.svg"
            
            formatted_items.append({
                "productId": str(item["product_id"]),
                "name": item["name"],
                "price": item["price"],
                "quantity": item["quantity"],
                "image": image
            })
        
        formatted_orders.append({
            "id": str(order["id"]),
            "userId": str(order["user_id"]),
            "items": formatted_items,
            "total": order["total"],
            "status": order["status"],
            "createdAt": order["created_at"],
            "address": order["address"],
            "paymentMethod": order["payment_method"]
        })
    
    return jsonify({"orders": formatted_orders})

@app.route('/api/orders/<order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    order = order_model.get_by_id(order_id, user_id=request.user_id)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Format response to match frontend expectations
    formatted_items = []
    for item in order["items"]:
        # Make sure image is always defined
        image = item.get("image") or "/placeholder.svg"
        
        formatted_items.append({
            "productId": str(item["product_id"]),
            "name": item["name"],
            "price": item["price"],
            "quantity": item["quantity"],
            "image": image
        })
    
    formatted_order = {
        "id": str(order["id"]),
        "userId": str(order["user_id"]),
        "items": formatted_items,
        "total": order["total"],
        "status": order["status"],
        "createdAt": order["created_at"],
        "address": order["address"],
        "paymentMethod": order["payment_method"]
    }
    
    return jsonify({"order": formatted_order})

@app.route('/api/orders', methods=['POST'])
@login_required
def create_order():
    data = request.json
    address = data.get('address')
    payment_method = data.get('paymentMethod')
    
    if not address or not payment_method:
        return jsonify({"error": "Address and payment method are required"}), 400
    
    # Get cart items
    cart_items = cart_model.get_items(request.user_id)
    
    if not cart_items:
        # More descriptive error message for empty cart
        return jsonify({"error": "Cart is empty. Please add items to your cart before placing an order."}), 400
    
    # Log cart items for debugging
    print(f"Creating order for user {request.user_id} with {len(cart_items)} items in cart.")
    for item in cart_items:
        print(f"  - Product {item['product_id']}: {item['name']} (Qty: {item['quantity']}, Price: {item['price']})")
    
    # Calculate total
    total = sum(item["price"] * item["quantity"] for item in cart_items)
    
    # Create order
    try:
        order_id = order_model.create(
            user_id=request.user_id,
            total=total,
            address=address,
            payment_method=payment_method
        )
        
        # Add order items
        for item in cart_items:
            # Make sure image is always defined
            image = item.get("image") or "/placeholder.svg"
            
            order_model.add_item(
                order_id=order_id,
                product_id=item["product_id"],
                name=item["name"],
                price=item["price"],
                quantity=item["quantity"],
                image=image
            )
        
        # Clear cart after successful order creation
        cart_model.clear(request.user_id)
        
        # Get created order
        order = order_model.get_by_id(order_id)
        
        # Format response to match frontend expectations
        formatted_items = []
        for item in order["items"]:
            # Make sure image is always defined
            image = item.get("image") or "/placeholder.svg"
            
            formatted_items.append({
                "productId": f"prod-{item['product_id']}",  # Format product ID as expected by frontend
                "name": item["name"],
                "price": item["price"],
                "quantity": item["quantity"],
                "image": image
            })
        
        formatted_order = {
            "id": f"order-{order['id']}",  # Format order ID as expected by frontend
            "userId": str(order["user_id"]),
            "items": formatted_items,
            "total": order["total"],
            "status": order["status"],
            "createdAt": order["created_at"],
            "address": order["address"],
            "paymentMethod": order["payment_method"]
        }
        
        return jsonify({"order": formatted_order}), 201
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        return jsonify({"error": f"Error creating order: {str(e)}"}), 500

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@login_required
def update_order_status(order_id):
    data = request.json
    status = data.get('status')
    
    if not status:
        return jsonify({"error": "Status is required"}), 400
    
    # Check if order exists and belongs to user
    order = order_model.get_by_id(order_id, user_id=request.user_id)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Valid statuses
    valid_statuses = ["to-pay", "to-ship", "to-receive", "completed"]
    
    if status not in valid_statuses:
        return jsonify({"error": "Invalid status"}), 400
    
    # Update status
    success = order_model.update_status(order_id, status)
    
    if success:
        return jsonify({"message": "Order status updated"})
    else:
        return jsonify({"error": "Error updating order status"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 