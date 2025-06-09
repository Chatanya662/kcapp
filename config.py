from pymongo import MongoClient
import os
from datetime import datetime

# MongoDB connection configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'milk_delivery_db')

class InMemoryStorage:
    """Simple in-memory storage for development when MongoDB is not available"""
    def __init__(self):
        self.users = []
        self.customers = []
        self.deliveries = []
    
    def find_one(self, collection, query):
        data = getattr(self, collection, [])
        for item in data:
            if self._match_query(item, query):
                return item
        return None
    
    def find(self, collection, query=None):
        data = getattr(self, collection, [])
        if query is None:
            return data
        return [item for item in data if self._match_query(item, query)]
    
    def insert_one(self, collection, document):
        data = getattr(self, collection, [])
        data.append(document)
        return type('Result', (), {'inserted_id': document.get('_id')})()
    
    def update_one(self, collection, query, update):
        data = getattr(self, collection, [])
        for i, item in enumerate(data):
            if self._match_query(item, query):
                if '$set' in update:
                    item.update(update['$set'])
                return type('Result', (), {'modified_count': 1})()
        return type('Result', (), {'modified_count': 0})()
    
    def delete_one(self, collection, query):
        data = getattr(self, collection, [])
        for i, item in enumerate(data):
            if self._match_query(item, query):
                data.pop(i)
                return type('Result', (), {'deleted_count': 1})()
        return type('Result', (), {'deleted_count': 0})()
    
    def aggregate(self, collection, pipeline):
        # Simple aggregation for basic statistics
        data = getattr(self, collection, [])
        
        # Apply match stage if present
        for stage in pipeline:
            if '$match' in stage:
                match_query = stage['$match']
                data = [item for item in data if self._match_query(item, match_query)]
            elif '$group' in stage:
                group_stage = stage['$group']
                if group_stage.get('_id') is None:
                    # Simple aggregation for all documents
                    result = {
                        'total_deliveries': len(data),
                        'delivered_count': len([d for d in data if d.get('status') == 'Delivered']),
                        'pending_count': len([d for d in data if d.get('status') == 'Pending']),
                        'issue_count': len([d for d in data if d.get('status') == 'Issue']),
                        'total_quantity': sum(d.get('quantity', 0) for d in data)
                    }
                    return [result]
        return []
    
    def _match_query(self, item, query):
        for key, value in query.items():
            if key not in item:
                return False
            if isinstance(value, dict):
                # Handle operators like $gte, $lte
                item_value = item[key]
                for op, op_value in value.items():
                    if op == '$gte' and item_value < op_value:
                        return False
                    elif op == '$lte' and item_value > op_value:
                        return False
            else:
                if item[key] != value:
                    return False
        return True

class MockCollection:
    """Mock collection that uses in-memory storage"""
    def __init__(self, storage, name):
        self.storage = storage
        self.name = name
    
    def find_one(self, query):
        return self.storage.find_one(self.name, query)
    
    def find(self, query=None):
        return self.storage.find(self.name, query)
    
    def insert_one(self, document):
        return self.storage.insert_one(self.name, document)
    
    def update_one(self, query, update):
        return self.storage.update_one(self.name, query, update)
    
    def delete_one(self, query):
        return self.storage.delete_one(self.name, query)
    
    def aggregate(self, pipeline):
        return self.storage.aggregate(self.name, pipeline)
    
    def sort(self, field, direction):
        # Return self for chaining, sorting will be handled in find
        return self

class MockDatabase:
    """Mock database that uses in-memory storage"""
    def __init__(self, storage):
        self.storage = storage
        self.users = MockCollection(storage, 'users')
        self.customers = MockCollection(storage, 'customers')
        self.deliveries = MockCollection(storage, 'deliveries')

class Database:
    _instance = None
    _client = None
    _db = None
    _storage = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        if self._db is None:
            try:
                self._client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
                # Test connection with a short timeout
                self._client.admin.command('ping')
                self._db = self._client[DATABASE_NAME]
                print(f"Connected to MongoDB database: {DATABASE_NAME}")
            except Exception as e:
                print(f"MongoDB not available: {e}")
                print("Using in-memory storage for development")
                # Use in-memory storage as fallback
                self._storage = InMemoryStorage()
                self._db = MockDatabase(self._storage)
        return self._db
    
    def get_db(self):
        if self._db is None:
            return self.connect()
        return self._db
    
    def close(self):
        if self._client:
            self._client.close()

# Global database instance
db_instance = Database()

