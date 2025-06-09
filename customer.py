from datetime import datetime
from bson import ObjectId
from src.database.config import db_instance

class Customer:
    def __init__(self, name, address, mobile, _id=None):
        self._id = _id or ObjectId()
        self.name = name
        self.address = address
        self.mobile = mobile
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': str(self._id),
            'name': self.name,
            'address': self.address,
            'mobile': self.mobile,
            'created_at': self.created_at.isoformat()
        }
    
    def save(self):
        db = db_instance.get_db()
        if db is None:
            return None
        
        customer_data = {
            '_id': self._id,
            'name': self.name,
            'address': self.address,
            'mobile': self.mobile,
            'created_at': self.created_at
        }
        
        result = db.customers.insert_one(customer_data)
        return result.inserted_id
    
    def update(self):
        db = db_instance.get_db()
        if db is None:
            return False
        
        update_data = {
            'name': self.name,
            'address': self.address,
            'mobile': self.mobile
        }
        
        result = db.customers.update_one(
            {'_id': self._id},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def find_by_id(customer_id):
        db = db_instance.get_db()
        if db is None:
            return None
        
        customer_data = db.customers.find_one({'_id': ObjectId(customer_id)})
        if customer_data:
            customer = Customer(
                name=customer_data['name'],
                address=customer_data['address'],
                mobile=customer_data['mobile'],
                _id=customer_data['_id']
            )
            customer.created_at = customer_data['created_at']
            return customer
        return None
    
    @staticmethod
    def find_by_mobile(mobile):
        db = db_instance.get_db()
        if db is None:
            return None
        
        customer_data = db.customers.find_one({'mobile': mobile})
        if customer_data:
            customer = Customer(
                name=customer_data['name'],
                address=customer_data['address'],
                mobile=customer_data['mobile'],
                _id=customer_data['_id']
            )
            customer.created_at = customer_data['created_at']
            return customer
        return None
    
    @staticmethod
    def get_all():
        db = db_instance.get_db()
        if db is None:
            return []
        
        customers = []
        for customer_data in db.customers.find():
            customer = Customer(
                name=customer_data['name'],
                address=customer_data['address'],
                mobile=customer_data['mobile'],
                _id=customer_data['_id']
            )
            customer.created_at = customer_data['created_at']
            customers.append(customer)
        return customers
    
    @staticmethod
    def delete_by_id(customer_id):
        db = db_instance.get_db()
        if db is None:
            return False
        
        result = db.customers.delete_one({'_id': ObjectId(customer_id)})
        return result.deleted_count > 0

