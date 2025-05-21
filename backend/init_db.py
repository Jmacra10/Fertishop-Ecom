import os
import json
from models import Database, User, Category, Product, UseCase
from auth import hash_password
import sqlite3

def main():
    # Remove existing database if it exists
    if os.path.exists('fertishop.db'):
        print("Removing existing database...")
        os.remove('fertishop.db')
    
    # Create a new database
    print("Creating new database...")
    db = Database()
    
    # Initialize models
    user_model = User(db)
    category_model = Category(db)
    product_model = Product(db)
    use_case_model = UseCase(db)
    
    # Create demo user
    print("Creating demo user...")
    user_model.create(
        name="Demo User",
        email="demo@example.com",
        password=hash_password("password")
    )
    
    # Create categories
    print("Creating categories...")
    categories = [
        {"name": "Organic Fertilizers", "slug": "organic", 
         "image": "/images/products/organic-category.jpg"},
        {"name": "Soil Enhancers", "slug": "soil-enhancer", 
         "image": "/images/products/soil-enhancer-category.jpg"},
        {"name": "Plant Nutrients", "slug": "plant-nutrients", 
         "image": "/images/products/plant-nutrients-category.jpg"},
        {"name": "Growth Boosters", "slug": "growth-booster", 
         "image": "/images/products/growth-booster-category.jpg"},
    ]
    
    category_mapping = {}
    
    for category in categories:
        result = category_model.create(category["name"], category["slug"], category["image"])
        if result:
            category_mapping[category["slug"]] = result["id"]
    
    # Create use cases
    print("Creating use cases...")
    use_cases = [
        {"name": "For Yellow Leaves", "slug": "yellow-leaves"},
        {"name": "Root Growth", "slug": "root-growth"},
        {"name": "Boost Production", "slug": "boost-production"},
        {"name": "Soil Health", "slug": "soil-health"},
        {"name": "Pest Control", "slug": "pest-control"},
        {"name": "Disease Control", "slug": "disease-control"},
        {"name": "Nutrient Deficiency", "slug": "nutrient-deficiency"},
        {"name": "Drought Resistance", "slug": "drought-resistance"},
    ]
    
    use_case_mapping = {}
    
    for use_case in use_cases:
        result = use_case_model.create(use_case["name"], use_case["slug"])
        if result:
            use_case_mapping[use_case["slug"]] = result["id"]
    
    # Create products
    print("Creating products...")
    products = [
        {
            "name": "EcoRich Organic Compost",
            "description": "Premium organic compost made from plant materials. Improves soil structure and provides essential nutrients for healthy plant growth. TREATS: Poor soil structure, nutrient deficiency, and low microbial activity.",
            "price": 349,
            "category": "organic",
            "use_cases": ["soil-health", "root-growth", "nutrient-deficiency"],
            "image": "/images/products/product-organic-compost.jpg",
            "sold_count": 1423,
            "stock": 50,
            "treatment_for": "Poor soil structure and nutrient deficiency"
        },
        {
            "name": "BioGrow Worm Castings",
            "description": "100% pure worm castings that improve soil aeration and drainage. TREATS: Compacted soil, poor water retention, and lack of beneficial microorganisms.",
            "price": 499,
            "category": "organic",
            "use_cases": ["soil-health", "root-growth"],
            "image": "/images/products/product-worm-castings.jpeg",
            "sold_count": 982,
            "stock": 35,
            "treatment_for": "Compacted soil and poor water retention"
        },
        {
            "name": "NatureFeed Bone Meal",
            "description": "Phosphorus-rich organic fertilizer made from ground animal bones. TREATS: Phosphorus deficiency, poor flowering, and weak root development.",
            "price": 299,
            "category": "organic",
            "use_cases": ["root-growth", "boost-production", "nutrient-deficiency"],
            "image": "/images/products/product-bone-meal.jpg",
            "sold_count": 756,
            "stock": 42,
            "treatment_for": "Phosphorus deficiency and poor flowering"
        },
        {
            "name": "SoilRevive pH Balancer",
            "description": "Balances soil pH levels for optimal nutrient availability. TREATS: Acidic or alkaline soil conditions that prevent nutrient uptake.",
            "price": 499,
            "category": "soil-enhancer",
            "use_cases": ["soil-health", "nutrient-deficiency"],
            "image": "/images/products/product-ph-balancer.jpg",
            "sold_count": 832,
            "stock": 38,
            "treatment_for": "Acidic or alkaline soil conditions"
        },
        {
            "name": "RootMaster Pro",
            "description": "Specialized formula designed to enhance root development. TREATS: Poor root establishment, transplant shock, and stunted growth.",
            "price": 599,
            "category": "soil-enhancer",
            "use_cases": ["root-growth"],
            "image": "/images/products/product-rootmaster.jpg",
            "sold_count": 756,
            "stock": 42,
            "treatment_for": "Poor root establishment and transplant shock"
        },
        {
            "name": "LeafShine Foliar Spray",
            "description": "Nutrient-rich foliar spray absorbed directly through leaves. TREATS: Yellowing leaves, nutrient deficiencies, and slow growth.",
            "price": 450,
            "category": "plant-nutrients",
            "use_cases": ["yellow-leaves", "nutrient-deficiency"],
            "image": "/images/products/plant-nutrients/LeafShine Foliar Spray.webp",
            "sold_count": 1205,
            "stock": 28,
            "treatment_for": "Yellowing leaves and nutrient deficiencies"
        },
        {
            "name": "IronBoost Chelated Iron",
            "description": "Highly available form of iron for plants. TREATS: Chlorosis (yellowing between leaf veins), iron deficiency, and poor chlorophyll production.",
            "price": 399,
            "category": "plant-nutrients",
            "use_cases": ["yellow-leaves", "nutrient-deficiency"],
            "image": "/images/products/plant-nutrients/IronBoost Chelated Iron.jpg",
            "sold_count": 876,
            "stock": 40,
            "treatment_for": "Chlorosis and iron deficiency"
        },
        {
            "name": "MicroNutrient Complete Mix",
            "description": "Premium blend of essential micronutrients for comprehensive plant nutrition. TREATS: Multiple nutrient deficiencies and imbalanced growth.",
            "price": 699,
            "category": "plant-nutrients",
            "use_cases": ["yellow-leaves", "nutrient-deficiency", "boost-production"],
            "image": "/images/products/plant-nutrients/MicroNutrient Complete Mix.jpg",
            "sold_count": 923,
            "stock": 35,
            "treatment_for": "Multiple nutrient deficiencies and imbalanced growth"
        },
        {
            "name": "BloomBoost Flowering Stimulant",
            "description": "Specialized formula to promote abundant flowering and bud development. TREATS: Lack of flowers and bud drop.",
            "price": 599,
            "category": "growth-booster",
            "use_cases": ["boost-production"],
            "image": "/images/products/growth-boosters/BloomBoost Flowering Stimulant.jpg",
            "sold_count": 543,
            "stock": 40,
            "treatment_for": "Lack of flowers and bud drop"
        },
        {
            "name": "FruitBoost Fruiting Formula",
            "description": "Enhanced nutrient mix designed to improve fruit size and prevent premature fruit drop. TREATS: Poor fruit size and premature fruit drop.",
            "price": 649,
            "category": "growth-booster",
            "use_cases": ["boost-production"],
            "image": "/images/products/growth-boosters/FruitBoost Fruiting Formula.jpg",
            "sold_count": 876,
            "stock": 32,
            "treatment_for": "Poor fruit size and premature fruit drop"
        },
        {
            "name": "HarvestMax Yield Booster",
            "description": "Premium formula to increase overall yield and improve crop quality. TREATS: Low yield and poor fruit set.",
            "price": 699,
            "category": "growth-booster",
            "use_cases": ["boost-production", "yellow-leaves"],
            "image": "/images/products/growth-boosters/HarvestMax Yield Booster.webp",
            "sold_count": 982,
            "stock": 30,
            "treatment_for": "Low yield and poor fruit set"
        }
    ]
    
    for product_data in products:
        category_id = category_mapping.get(product_data["category"])
        if not category_id:
            print(f"Category not found: {product_data['category']}")
            continue
        
        product_id = product_model.create(
            name=product_data["name"],
            description=product_data["description"],
            price=product_data["price"],
            category_id=category_id,
            image=product_data["image"],
            stock=product_data["stock"],
            treatment_for=product_data["treatment_for"]
        )
        
        # Update sold count manually since our model doesn't expose this
        db_conn = db.get_connection()
        cursor = db_conn.cursor()
        cursor.execute(
            "UPDATE products SET sold_count = ? WHERE id = ?",
            (product_data["sold_count"], product_id)
        )
        db_conn.commit()
        
        # Add use cases
        for use_case_slug in product_data["use_cases"]:
            use_case_id = use_case_mapping.get(use_case_slug)
            if use_case_id:
                product_model.add_use_case(product_id, use_case_id)
    
    print("Database initialization completed!")
    db.close_connection()

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
    
    db.close_connection()
    print("Database initialization complete")

if __name__ == "__main__":
    main()
    create_test_user() 