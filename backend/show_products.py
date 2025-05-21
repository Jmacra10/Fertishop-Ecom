import sqlite3

# Connect to the database
conn = sqlite3.connect('fertishop.db')

# Set row factory to get dict-like results
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Query to get all products with their IDs and names
cursor.execute('SELECT id, name, category_id FROM products')
products = cursor.fetchall()

print('Product IDs:')
for product in products:
    print(f'{product["id"]}: {product["name"]} (Category ID: {product["category_id"]})')

# Close the connection
conn.close() 