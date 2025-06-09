from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from src.models.user import User
from src.models.customer import Customer
from src.models.delivery import Delivery
from src.database.config import db_instance

reports_bp = Blueprint('reports', __name__)

def admin_required():
    """Check if current user is admin"""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(current_user_id)
    return current_user and current_user.role == 'admin'

@reports_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_delivery_summary():
    try:
        if not admin_required():
            return jsonify({'error': 'Admin access required'}), 403
        
        db = db_instance.get_db()
        if db is None:
            return jsonify({
                'total_deliveries': 0,
                'delivered_count': 0,
                'pending_count': 0,
                'issue_count': 0,
                'total_quantity': 0
            }), 200
        
        # Get date range from query parameters (optional)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = {}
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query['delivery_date'] = {'$gte': start, '$lte': end}
        
        # Aggregate delivery statistics
        pipeline = [
            {'$match': query},
            {
                '$group': {
                    '_id': None,
                    'total_deliveries': {'$sum': 1},
                    'delivered_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Delivered']}, 1, 0]}
                    },
                    'pending_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Pending']}, 1, 0]}
                    },
                    'issue_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Issue']}, 1, 0]}
                    },
                    'total_quantity': {'$sum': '$quantity'}
                }
            }
        ]
        
        result = list(db.deliveries.aggregate(pipeline))
        
        if result:
            summary = result[0]
            return jsonify({
                'total_deliveries': summary['total_deliveries'],
                'delivered_count': summary['delivered_count'],
                'pending_count': summary['pending_count'],
                'issue_count': summary['issue_count'],
                'total_quantity': summary['total_quantity']
            }), 200
        else:
            return jsonify({
                'total_deliveries': 0,
                'delivered_count': 0,
                'pending_count': 0,
                'issue_count': 0,
                'total_quantity': 0
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/customer/<customer_id>', methods=['GET'])
@jwt_required()
def get_customer_report(customer_id):
    try:
        if not admin_required():
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate customer exists
        customer = Customer.find_by_id(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        # Get date range from query parameters (optional)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        db = db_instance.get_db()
        if db is None:
            return jsonify([]), 200
        
        # Build query
        query = {'customer_id': customer._id}
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query['delivery_date'] = {'$gte': start, '$lte': end}
        
        # Get customer deliveries
        deliveries = []
        for delivery_data in db.deliveries.find(query).sort('delivery_date', -1):
            deliveries.append({
                'date': delivery_data['delivery_date'].isoformat(),
                'status': delivery_data['status'],
                'quantity': delivery_data['quantity'],
                'notes': delivery_data.get('notes', ''),
                'timestamp': delivery_data['timestamp'].isoformat()
            })
        
        return jsonify({
            'customer': customer.to_dict(),
            'deliveries': deliveries
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/delivery-boy/<delivery_boy_id>', methods=['GET'])
@jwt_required()
def get_delivery_boy_report(delivery_boy_id):
    try:
        if not admin_required():
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate delivery boy exists
        delivery_boy = User.find_by_id(delivery_boy_id)
        if not delivery_boy or delivery_boy.role != 'delivery_boy':
            return jsonify({'error': 'Delivery boy not found'}), 404
        
        # Get date range from query parameters (optional)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        db = db_instance.get_db()
        if db is None:
            return jsonify([]), 200
        
        # Build query
        query = {'delivery_boy_id': delivery_boy._id}
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query['delivery_date'] = {'$gte': start, '$lte': end}
        
        # Aggregate delivery boy statistics
        pipeline = [
            {'$match': query},
            {
                '$group': {
                    '_id': None,
                    'total_deliveries': {'$sum': 1},
                    'delivered_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Delivered']}, 1, 0]}
                    },
                    'pending_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Pending']}, 1, 0]}
                    },
                    'issue_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Issue']}, 1, 0]}
                    },
                    'total_quantity': {'$sum': '$quantity'}
                }
            }
        ]
        
        result = list(db.deliveries.aggregate(pipeline))
        
        if result:
            summary = result[0]
            stats = {
                'total_deliveries': summary['total_deliveries'],
                'delivered_count': summary['delivered_count'],
                'pending_count': summary['pending_count'],
                'issue_count': summary['issue_count'],
                'total_quantity': summary['total_quantity']
            }
        else:
            stats = {
                'total_deliveries': 0,
                'delivered_count': 0,
                'pending_count': 0,
                'issue_count': 0,
                'total_quantity': 0
            }
        
        return jsonify({
            'delivery_boy': delivery_boy.to_dict(),
            'statistics': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/daily/<report_date>', methods=['GET'])
@jwt_required()
def get_daily_report(report_date):
    try:
        if not admin_required():
            return jsonify({'error': 'Admin access required'}), 403
        
        db = db_instance.get_db()
        if db is None:
            return jsonify({
                'date': report_date,
                'total_deliveries': 0,
                'delivered_count': 0,
                'pending_count': 0,
                'issue_count': 0,
                'total_quantity': 0,
                'delivery_boys': []
            }), 200
        
        query_date = datetime.strptime(report_date, '%Y-%m-%d').date()
        
        # Aggregate daily statistics
        pipeline = [
            {'$match': {'delivery_date': query_date}},
            {
                '$group': {
                    '_id': None,
                    'total_deliveries': {'$sum': 1},
                    'delivered_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Delivered']}, 1, 0]}
                    },
                    'pending_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Pending']}, 1, 0]}
                    },
                    'issue_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Issue']}, 1, 0]}
                    },
                    'total_quantity': {'$sum': '$quantity'}
                }
            }
        ]
        
        result = list(db.deliveries.aggregate(pipeline))
        
        if result:
            summary = result[0]
            stats = {
                'total_deliveries': summary['total_deliveries'],
                'delivered_count': summary['delivered_count'],
                'pending_count': summary['pending_count'],
                'issue_count': summary['issue_count'],
                'total_quantity': summary['total_quantity']
            }
        else:
            stats = {
                'total_deliveries': 0,
                'delivered_count': 0,
                'pending_count': 0,
                'issue_count': 0,
                'total_quantity': 0
            }
        
        # Get delivery boy performance for the day
        delivery_boy_pipeline = [
            {'$match': {'delivery_date': query_date}},
            {
                '$group': {
                    '_id': '$delivery_boy_id',
                    'total_deliveries': {'$sum': 1},
                    'delivered_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Delivered']}, 1, 0]}
                    },
                    'pending_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Pending']}, 1, 0]}
                    },
                    'issue_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'Issue']}, 1, 0]}
                    },
                    'total_quantity': {'$sum': '$quantity'}
                }
            }
        ]
        
        delivery_boy_results = list(db.deliveries.aggregate(delivery_boy_pipeline))
        
        delivery_boys = []
        for db_result in delivery_boy_results:
            delivery_boy = User.find_by_id(str(db_result['_id']))
            if delivery_boy:
                delivery_boys.append({
                    'delivery_boy': delivery_boy.to_dict(),
                    'statistics': {
                        'total_deliveries': db_result['total_deliveries'],
                        'delivered_count': db_result['delivered_count'],
                        'pending_count': db_result['pending_count'],
                        'issue_count': db_result['issue_count'],
                        'total_quantity': db_result['total_quantity']
                    }
                })
        
        return jsonify({
            'date': report_date,
            'overall_statistics': stats,
            'delivery_boys': delivery_boys
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

