#!/usr/bin/env python3
"""
Database initialization script for Milk Delivery App
Creates a default admin user for initial setup
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import User
from src.database.config import db_instance

def init_database():
    """Initialize database with default admin user"""
    print("Initializing Milk Delivery Database...")
    
    # Connect to database
    db = db_instance.connect()
    
    if db is None:
        print("Warning: MongoDB not available. Using in-memory storage for development.")
    else:
        print("Connected to MongoDB successfully.")
    
    # Check if admin user already exists
    admin_user = User.find_by_username('admin')
    
    if admin_user:
        print("Admin user already exists.")
        print(f"Username: admin")
        print("Use the existing admin credentials to login.")
        return
    
    # Create default admin user
    admin = User(
        username='admin',
        password='admin123',  # Change this in production!
        role='admin',
        name='System Administrator'
    )
    
    admin_id = admin.save()
    
    if admin_id:
        print("✅ Default admin user created successfully!")
        print("Login credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("⚠️  IMPORTANT: Change the default password in production!")
    else:
        print("❌ Failed to create admin user.")
    
    # Create a sample delivery boy user
    delivery_boy = User.find_by_username('delivery_boy1')
    
    if not delivery_boy:
        delivery_boy = User(
            username='delivery_boy1',
            password='delivery123',
            role='delivery_boy',
            name='John Delivery'
        )
        
        delivery_boy_id = delivery_boy.save()
        
        if delivery_boy_id:
            print("✅ Sample delivery boy user created!")
            print("Login credentials:")
            print("  Username: delivery_boy1")
            print("  Password: delivery123")
        else:
            print("❌ Failed to create delivery boy user.")
    
    print("\nDatabase initialization completed!")
    print("You can now start the Flask application with: python src/main.py")

if __name__ == '__main__':
    init_database()

