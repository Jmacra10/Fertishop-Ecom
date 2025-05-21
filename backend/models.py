import sqlite3
import json
import os
from datetime import datetime, timedelta
import threading

class Database:
    def __init__(self, db_file="fertishop.db"):
        self.db_file = db_file
        self.conn = None
        self._local = threading.local()  # Thread-local storage for connections
        self.initialize_db()
        
    def get_connection(self):
        # Create a new connection for each thread if it doesn't exist
        if not hasattr(self._local, 'conn') or self._local.conn is None:
            self._local.conn = sqlite3.connect(self.db_file)
            self._local.conn.row_factory = sqlite3.Row
        return self._local.conn
        
    def close_connection(self):
        if hasattr(self._local, 'conn') and self._local.conn:
            self._local.conn.close()
            self._local.conn = None
    
    def initialize_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create User table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create Category table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            image TEXT
        )
        ''')
        
        # Create Product table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category_id INTEGER,
            image TEXT,
            sold_count INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 0,
            treatment_for TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
        ''')
        
        # Create UseCase table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS use_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL
        )
        ''')
        
        # Create Product-UseCase join table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_use_cases (
            product_id INTEGER,
            use_case_id INTEGER,
            PRIMARY KEY (product_id, use_case_id),
            FOREIGN KEY (product_id) REFERENCES products (id),
            FOREIGN KEY (use_case_id) REFERENCES use_cases (id)
        )
        ''')
        
        # Create Order table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create OrderItem table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            image TEXT,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
        ''')
        
        # Create Cart table (to store cart items for users)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id),
            UNIQUE(user_id, product_id)
        )
        ''')
        
        conn.commit()


class User:
    def __init__(self, db):
        self.db = db
    
    def create(self, name, email, password):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                (name, email, password)
            )
            conn.commit()
            return {"id": cursor.lastrowid, "name": name, "email": email}
        except sqlite3.IntegrityError:
            return None
    
    def get_by_email(self, email):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None
    
    def get_by_id(self, user_id):
        if not user_id:
            return None
            
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None


class Category:
    def __init__(self, db):
        self.db = db
    
    def get_all(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM categories")
        categories = cursor.fetchall()
        
        return [dict(category) for category in categories]
    
    def get_by_slug(self, slug):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM categories WHERE slug = ?", (slug,))
        category = cursor.fetchone()
        
        if category:
            return dict(category)
        return None
    
    def create(self, name, slug, image):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)",
                (name, slug, image)
            )
            conn.commit()
            return {"id": cursor.lastrowid, "name": name, "slug": slug, "image": image}
        except sqlite3.IntegrityError:
            return None


class UseCase:
    def __init__(self, db):
        self.db = db
    
    def get_all(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM use_cases")
        use_cases = cursor.fetchall()
        
        return [dict(use_case) for use_case in use_cases]
    
    def get_by_slug(self, slug):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM use_cases WHERE slug = ?", (slug,))
        use_case = cursor.fetchone()
        
        if use_case:
            return dict(use_case)
        return None
    
    def create(self, name, slug):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO use_cases (name, slug) VALUES (?, ?)",
                (name, slug)
            )
            conn.commit()
            return {"id": cursor.lastrowid, "name": name, "slug": slug}
        except sqlite3.IntegrityError:
            return None


class Product:
    def __init__(self, db):
        self.db = db
    
    def create(self, name, description, price, category_id, image, stock, treatment_for):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO products (name, description, price, category_id, image, stock, treatment_for) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (name, description, price, category_id, image, stock, treatment_for)
        )
        conn.commit()
        return cursor.lastrowid
    
    def add_use_case(self, product_id, use_case_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO product_use_cases (product_id, use_case_id) VALUES (?, ?)",
                (product_id, use_case_id)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def get_by_id(self, product_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        """, (product_id,))
        
        product = cursor.fetchone()
        
        if not product:
            return None
        
        product_dict = dict(product)
        
        # Get use cases for this product
        cursor.execute("""
            SELECT uc.id, uc.name, uc.slug
            FROM use_cases uc
            JOIN product_use_cases puc ON uc.id = puc.use_case_id
            WHERE puc.product_id = ?
        """, (product_id,))
        
        use_cases = cursor.fetchall()
        product_dict['use_cases'] = [dict(uc) for uc in use_cases]
        
        return product_dict
    
    def get_all(self, limit=None, offset=0, category_slug=None, use_case_slug=None, search=None):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p
            JOIN categories c ON p.category_id = c.id
        """
        
        params = []
        where_clauses = []
        
        if category_slug:
            where_clauses.append("c.slug = ?")
            params.append(category_slug)
        
        if use_case_slug:
            query += """
                JOIN product_use_cases puc ON p.id = puc.product_id
                JOIN use_cases uc ON puc.use_case_id = uc.id
            """
            where_clauses.append("uc.slug = ?")
            params.append(use_case_slug)
        
        if search:
            where_clauses.append("(p.name LIKE ? OR p.description LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%"])
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " GROUP BY p.id ORDER BY p.sold_count DESC"
        
        if limit:
            query += " LIMIT ? OFFSET ?"
            params.extend([limit, offset])
        
        cursor.execute(query, params)
        products = cursor.fetchall()
        
        result = []
        for product in products:
            product_dict = dict(product)
            
            # Get use cases for this product
            cursor.execute("""
                SELECT uc.id, uc.name, uc.slug
                FROM use_cases uc
                JOIN product_use_cases puc ON uc.id = puc.use_case_id
                WHERE puc.product_id = ?
            """, (product_dict['id'],))
            
            use_cases = cursor.fetchall()
            product_dict['use_cases'] = [dict(uc) for uc in use_cases]
            
            result.append(product_dict)
        
        return result
    
    def get_featured(self, limit=6):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.sold_count DESC
            LIMIT ?
        """, (limit,))
        
        products = cursor.fetchall()
        
        result = []
        for product in products:
            product_dict = dict(product)
            
            # Get use cases for this product
            cursor.execute("""
                SELECT uc.id, uc.name, uc.slug
                FROM use_cases uc
                JOIN product_use_cases puc ON uc.id = puc.use_case_id
                WHERE puc.product_id = ?
            """, (product_dict['id'],))
            
            use_cases = cursor.fetchall()
            product_dict['use_cases'] = [dict(uc) for uc in use_cases]
            
            result.append(product_dict)
        
        return result
    
    def get_related(self, product_id, limit=4):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # First get the category of the current product
        cursor.execute("SELECT category_id FROM products WHERE id = ?", (product_id,))
        result = cursor.fetchone()
        
        if not result:
            return []
        
        category_id = result['category_id']
        
        # Get products from the same category, excluding the current product
        cursor.execute("""
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ? AND p.id != ?
            ORDER BY p.sold_count DESC
            LIMIT ?
        """, (category_id, product_id, limit))
        
        products = cursor.fetchall()
        
        result = []
        for product in products:
            product_dict = dict(product)
            
            # Get use cases for this product
            cursor.execute("""
                SELECT uc.id, uc.name, uc.slug
                FROM use_cases uc
                JOIN product_use_cases puc ON uc.id = puc.use_case_id
                WHERE puc.product_id = ?
            """, (product_dict['id'],))
            
            use_cases = cursor.fetchall()
            product_dict['use_cases'] = [dict(uc) for uc in use_cases]
            
            result.append(product_dict)
        
        return result


class Order:
    def __init__(self, db):
        self.db = db
    
    def create(self, user_id, total, address, payment_method):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Initial status is "to-pay"
        status = "to-pay"
        
        # Insert the order
        cursor.execute(
            "INSERT INTO orders (user_id, total, status, address, payment_method) VALUES (?, ?, ?, ?, ?)",
            (user_id, total, status, json.dumps(address), payment_method)
        )
        
        order_id = cursor.lastrowid
        conn.commit()
        
        return order_id
    
    def add_item(self, order_id, product_id, name, price, quantity, image=None):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # If image was not provided, try to get it from the product
        if image is None:
            cursor.execute("SELECT image FROM products WHERE id = ?", (product_id,))
            product = cursor.fetchone()
            if product and product["image"]:
                image = product["image"]
            else:
                image = "/placeholder.svg"
        
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)",
            (order_id, product_id, name, price, quantity, image)
        )
        
        # Update product sold_count and stock
        cursor.execute(
            "UPDATE products SET sold_count = sold_count + ?, stock = stock - ? WHERE id = ?",
            (quantity, quantity, product_id)
        )
        
        conn.commit()
        return cursor.lastrowid
    
    def get_by_id(self, order_id, user_id=None):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM orders WHERE id = ?"
        params = [order_id]
        
        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)
        
        cursor.execute(query, params)
        order = cursor.fetchone()
        
        if not order:
            return None
        
        order_dict = dict(order)
        order_dict['address'] = json.loads(order_dict['address'])
        
        # Get order items
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
        items = cursor.fetchall()
        
        order_dict['items'] = [dict(item) for item in items]
        
        return order_dict
    
    def get_user_orders(self, user_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        orders = cursor.fetchall()
        
        result = []
        for order in orders:
            order_dict = dict(order)
            order_dict['address'] = json.loads(order_dict['address'])
            
            # Get order items
            cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_dict['id'],))
            items = cursor.fetchall()
            
            order_dict['items'] = [dict(item) for item in items]
            
            result.append(order_dict)
        
        return result
    
    def update_status(self, order_id, status):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE orders SET status = ? WHERE id = ?",
            (status, order_id)
        )
        
        conn.commit()
        return cursor.rowcount > 0


class Cart:
    def __init__(self, db):
        self.db = db
    
    def add_item(self, user_id, product_id, quantity):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        try:
            # Check if item already exists in cart
            cursor.execute(
                "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
                (user_id, product_id)
            )
            existing_item = cursor.fetchone()
            
            if existing_item:
                # Update quantity
                cursor.execute(
                    "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
                    (quantity, user_id, product_id)
                )
            else:
                # Insert new item
                cursor.execute(
                    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
                    (user_id, product_id, quantity)
                )
            
            conn.commit()
            return True
        except Exception as e:
            print(f"Error adding item to cart: {e}")
            return False
    
    def update_quantity(self, user_id, product_id, quantity):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        if quantity <= 0:
            # Remove item if quantity is 0 or negative
            cursor.execute(
                "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
                (user_id, product_id)
            )
        else:
            # Update quantity
            cursor.execute(
                "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
                (quantity, user_id, product_id)
            )
        
        conn.commit()
        return cursor.rowcount > 0
    
    def remove_item(self, user_id, product_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
            (user_id, product_id)
        )
        
        conn.commit()
        return cursor.rowcount > 0
    
    def get_items(self, user_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT ci.product_id, p.name, p.price, ci.quantity, p.stock, p.image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        """, (user_id,))
        
        items = cursor.fetchall()
        return [dict(item) for item in items]
    
    def clear(self, user_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))
        
        conn.commit()
        return cursor.rowcount > 0 