from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username']
        password = data['password']
        
        # Find user by username
        user = User.find_by_username(username)
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user._id))
        
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    try:
        # Only admin can register new users
        current_user_id = get_jwt_identity()
        current_user = User.find_by_id(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Only admin can register new users'}), 403
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'password', 'role', 'name']):
            return jsonify({'error': 'Username, password, role, and name are required'}), 400
        
        username = data['username']
        password = data['password']
        role = data['role']
        name = data['name']
        
        # Validate role
        if role not in ['admin', 'delivery_boy', 'customer']:
            return jsonify({'error': 'Invalid role. Must be admin, delivery_boy, or customer'}), 400
        
        # Check if username already exists
        existing_user = User.find_by_username(username)
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 409
        
        # Create new user
        new_user = User(username=username, password=password, role=role, name=name)
        user_id = new_user.save()
        
        if user_id:
            return jsonify(new_user.to_dict()), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/init-admin', methods=['POST'])
def init_admin():
    """Initialize the first admin user - only works if no admin exists"""
    try:
        # Check if any admin user already exists
        from src.database.config import db_instance
        db = db_instance.get_db()
        
        if hasattr(db, 'users'):
            # Check for existing admin in in-memory storage
            existing_admins = [u for u in db.users.find({}) if u.get('role') == 'admin']
        else:
            # Check for existing admin in MongoDB
            existing_admins = list(db.users.find({'role': 'admin'}))
        
        if existing_admins:
            return jsonify({'error': 'Admin user already exists'}), 409
        
        # Create default admin user
        admin_user = User(
            username='admin',
            password='admin123',
            role='admin',
            name='System Administrator'
        )
        
        user_id = admin_user.save()
        
        if user_id:
            return jsonify({
                'message': 'Admin user created successfully',
                'user': admin_user.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Failed to create admin user'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

