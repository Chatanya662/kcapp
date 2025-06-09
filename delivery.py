from datetime import datetime, date
from bson import ObjectId
from src.database.config import db_instance

class Delivery:
    def __init__(self, customer_id, delivery_boy_id, delivery_date, quantity, 
                 status='Pending', notes='', photo_proof_url='', _id=None):
        self._id = _id or ObjectId()
        self.customer_id = ObjectId(customer_id) if isinstance(customer_id, str) else customer_id
        self.delivery_boy_id = ObjectId(delivery_boy_id) if isinstance(delivery_boy_id, str) else delivery_boy_id
        self.delivery_date = delivery_date if isinstance(delivery_date, date) else datetime.strptime(delivery_date, '%Y-%m-%d').date()
        self.quantity = quantity
        self.status = status  # 'Pending', 'Delivered', 'Issue'
        self.notes = notes
        self.photo_proof_url = photo_proof_url
        self.timestamp = datetime.utcnow()
        self.updated_by = None
        self.created_at = datetime.utcnow()
    
    def to_dict(self, include_customer=False, include_delivery_boy=False):
        result = {
            'id': str(self._id),
            'customer_id': str(self.customer_id),
            'delivery_boy_id': str(self.delivery_boy_id),
            'delivery_date': self.delivery_date.isoformat(),
            'quantity': self.quantity,
            'status': self.status,
            'notes': self.notes,
            'photo_proof_url': self.photo_proof_url,
            'timestamp': self.timestamp.isoformat(),
            'updated_by': str(self.updated_by) if self.updated_by else None,
            'created_at': self.created_at.isoformat()
        }
        
        if include_customer:
            from src.models.customer import Customer
            customer = Customer.find_by_id(str(self.customer_id))
            result['customer'] = customer.to_dict() if customer else None
        
        if include_delivery_boy:
            from src.models.user import User
            delivery_boy = User.find_by_id(str(self.delivery_boy_id))
            result['delivery_boy'] = delivery_boy.to_dict() if delivery_boy else None
        
        return result
    
    def save(self):
        db = db_instance.get_db()
        if db is None:
            return None
        
        delivery_data = {
            '_id': self._id,
            'customer_id': self.customer_id,
            'delivery_boy_id': self.delivery_boy_id,
            'delivery_date': self.delivery_date,
            'quantity': self.quantity,
            'status': self.status,
            'notes': self.notes,
            'photo_proof_url': self.photo_proof_url,
            'timestamp': self.timestamp,
            'updated_by': self.updated_by,
            'created_at': self.created_at
        }
        
        result = db.deliveries.insert_one(delivery_data)
        return result.inserted_id
    
    def update(self, updated_by_id):
        db = db_instance.get_db()
        if db is None:
            return False
        
        self.timestamp = datetime.utcnow()
        self.updated_by = ObjectId(updated_by_id) if isinstance(updated_by_id, str) else updated_by_id
        
        update_data = {
            'customer_id': self.customer_id,
            'delivery_boy_id': self.delivery_boy_id,
            'delivery_date': self.delivery_date,
            'quantity': self.quantity,
            'status': self.status,
            'notes': self.notes,
            'photo_proof_url': self.photo_proof_url,
            'timestamp': self.timestamp,
            'updated_by': self.updated_by
        }
        
        result = db.deliveries.update_one(
            {'_id': self._id},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def find_by_id(delivery_id):
        db = db_instance.get_db()
        if db is None:
            return None
        
        delivery_data = db.deliveries.find_one({'_id': ObjectId(delivery_id)})
        if delivery_data:
            delivery = Delivery(
                customer_id=delivery_data['customer_id'],
                delivery_boy_id=delivery_data['delivery_boy_id'],
                delivery_date=delivery_data['delivery_date'],
                quantity=delivery_data['quantity'],
                status=delivery_data['status'],
                notes=delivery_data['notes'],
                photo_proof_url=delivery_data['photo_proof_url'],
                _id=delivery_data['_id']
            )
            delivery.timestamp = delivery_data['timestamp']
            delivery.updated_by = delivery_data.get('updated_by')
            delivery.created_at = delivery_data['created_at']
            return delivery
        return None
    
    @staticmethod
    def find_by_date_and_delivery_boy(delivery_date, delivery_boy_id):
        db = db_instance.get_db()
        if db is None:
            return []
        
        query_date = delivery_date if isinstance(delivery_date, date) else datetime.strptime(delivery_date, '%Y-%m-%d').date()
        
        deliveries = []
        for delivery_data in db.deliveries.find({
            'delivery_date': query_date,
            'delivery_boy_id': ObjectId(delivery_boy_id)
        }):
            delivery = Delivery(
                customer_id=delivery_data['customer_id'],
                delivery_boy_id=delivery_data['delivery_boy_id'],
                delivery_date=delivery_data['delivery_date'],
                quantity=delivery_data['quantity'],
                status=delivery_data['status'],
                notes=delivery_data['notes'],
                photo_proof_url=delivery_data['photo_proof_url'],
                _id=delivery_data['_id']
            )
            delivery.timestamp = delivery_data['timestamp']
            delivery.updated_by = delivery_data.get('updated_by')
            delivery.created_at = delivery_data['created_at']
            deliveries.append(delivery)
        return deliveries
    
    @staticmethod
    def find_by_customer_id(customer_id):
        db = db_instance.get_db()
        if db is None:
            return []
        
        deliveries = []
        for delivery_data in db.deliveries.find({
            'customer_id': ObjectId(customer_id)
        }).sort('delivery_date', -1):
            delivery = Delivery(
                customer_id=delivery_data['customer_id'],
                delivery_boy_id=delivery_data['delivery_boy_id'],
                delivery_date=delivery_data['delivery_date'],
                quantity=delivery_data['quantity'],
                status=delivery_data['status'],
                notes=delivery_data['notes'],
                photo_proof_url=delivery_data['photo_proof_url'],
                _id=delivery_data['_id']
            )
            delivery.timestamp = delivery_data['timestamp']
            delivery.updated_by = delivery_data.get('updated_by')
            delivery.created_at = delivery_data['created_at']
            deliveries.append(delivery)
        return deliveries
    
    @staticmethod
    def get_all():
        db = db_instance.get_db()
        if db is None:
            return []
        
        deliveries = []
        for delivery_data in db.deliveries.find().sort('delivery_date', -1):
            delivery = Delivery(
                customer_id=delivery_data['customer_id'],
                delivery_boy_id=delivery_data['delivery_boy_id'],
                delivery_date=delivery_data['delivery_date'],
                quantity=delivery_data['quantity'],
                status=delivery_data['status'],
                notes=delivery_data['notes'],
                photo_proof_url=delivery_data['photo_proof_url'],
                _id=delivery_data['_id']
            )
            delivery.timestamp = delivery_data['timestamp']
            delivery.updated_by = delivery_data.get('updated_by')
            delivery.created_at = delivery_data['created_at']
            deliveries.append(delivery)
        return deliveries

