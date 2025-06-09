from datetime import datetime
from bson import ObjectId
import bcrypt
from src.database.config import db_instance

class User:
    def __init__(self, username, password, role, name, _id=None):
        self._id = _id or ObjectId()
        self.username = username
        self.password = self._hash_password(password) if password else None
        self.role = role  # 'admin', 'delivery_boy', 'customer'
        self.name = name
        self.created_at = datetime.utcnow()
    
    def _hash_password(self, password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': str(self._id),
            'username': self.username,
            'role': self.role,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }
    
    def save(self):
        db = db_instance.get_db()
        if db is None:
            return None
        
        user_data = {
            '_id': self._id,
            'username': self.username,
            'password': self.password,
            'role': self.role,
            'name': self.name,
            'created_at': self.created_at
        }
        
        result = db.users.insert_one(user_data)
        return result.inserted_id
    
    @staticmethod
    def find_by_username(username):
        db = db_instance.get_db()
        if db is None:
            return None
        
        user_data = db.users.find_one({'username': username})
        if user_data:
            user = User(
                username=user_data['username'],
                password=None,  # Don't pass password to avoid re-hashing
                role=user_data['role'],
                name=user_data['name'],
                _id=user_data['_id']
            )
            user.password = user_data['password']  # Set hashed password directly
            user.created_at = user_data['created_at']
            return user
        return None
    
    @staticmethod
    def find_by_id(user_id):
        db = db_instance.get_db()
        if db is None:
            return None
        
        user_data = db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            user = User(
                username=user_data['username'],
                password=None,
                role=user_data['role'],
                name=user_data['name'],
                _id=user_data['_id']
            )
            user.password = user_data['password']
            user.created_at = user_data['created_at']
            return user
        return None
    
    @staticmethod
    def get_all():
        db = db_instance.get_db()
        if db is None:
            return []
        
        users = []
        for user_data in db.users.find():
            user = User(
                username=user_data['username'],
                password=None,
                role=user_data['role'],
                name=user_data['name'],
                _id=user_data['_id']
            )
            user.password = user_data['password']
            user.created_at = user_data['created_at']
            users.append(user)
        return users

