from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import FAQ, Category, User, db
from datetime import datetime

faq_bp = Blueprint('faq', __name__)

@faq_bp.route('/faqs', methods=['GET'])
def get_faqs():
    try:
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search', '').lower()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Start query
        query = FAQ.query.filter_by(is_active=True)

        # Apply filters
        if category:
            query = query.filter_by(category=category)

        if search:
            query = query.filter(
                db.or_(
                    FAQ.question.ilike(f'%{search}%'),
                    FAQ.answer.ilike(f'%{search}%'),
                    FAQ.tags.ilike(f'%{search}%')
                )
            )

        # Order by order field, then by created_at
        query = query.order_by(FAQ.order.asc(), FAQ.created_at.desc())

        # Paginate
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        faqs = [faq.to_dict() for faq in pagination.items]

        return jsonify({
            'faqs': faqs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })

    except Exception as e:
        return jsonify({'error': 'Failed to fetch FAQs'}), 500

@faq_bp.route('/faqs', methods=['POST'])
@jwt_required()
def create_faq():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get('question') or not data.get('answer') or not data.get('category'):
            return jsonify({'error': 'Question, answer, and category are required'}), 400

        faq = FAQ(
            question=data['question'],
            answer=data['answer'],
            category=data['category'],
            tags=','.join(data.get('tags', [])),
            order=data.get('order', 0),
            created_by=current_user_id
        )

        db.session.add(faq)
        db.session.commit()

        return jsonify(faq.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create FAQ'}), 500

@faq_bp.route('/faqs/<int:faq_id>', methods=['GET'])
def get_faq(faq_id):
    try:
        faq = FAQ.query.get(faq_id)
        if not faq or not faq.is_active:
            return jsonify({'error': 'FAQ not found'}), 404

        return jsonify(faq.to_dict())

    except Exception as e:
        return jsonify({'error': 'Failed to fetch FAQ'}), 500

@faq_bp.route('/faqs/<int:faq_id>', methods=['PUT'])
@jwt_required()
def update_faq(faq_id):
    try:
        current_user_id = get_jwt_identity()
        faq = FAQ.query.get(faq_id)

        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Update fields
        if 'question' in data:
            faq.question = data['question']
        if 'answer' in data:
            faq.answer = data['answer']
        if 'category' in data:
            faq.category = data['category']
        if 'tags' in data:
            faq.tags = ','.join(data['tags'])
        if 'order' in data:
            faq.order = data['order']
        if 'is_active' in data:
            faq.is_active = data['is_active']

        faq.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify(faq.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update FAQ'}), 500

@faq_bp.route('/faqs/<int:faq_id>', methods=['DELETE'])
@jwt_required()
def delete_faq(faq_id):
    try:
        current_user_id = get_jwt_identity()
        faq = FAQ.query.get(faq_id)

        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404

        # Soft delete
        faq.is_active = False
        faq.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify({'message': 'FAQ deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete FAQ'}), 500

@faq_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.order.asc()).all()
        return jsonify([cat.to_dict() for cat in categories])

    except Exception as e:
        return jsonify({'error': 'Failed to fetch categories'}), 500

@faq_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get('name'):
            return jsonify({'error': 'Category name is required'}), 400

        # Check if category already exists
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Category already exists'}), 400

        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            icon=data.get('icon', 'fas fa-question'),
            color=data.get('color', '#2563eb'),
            order=data.get('order', 0)
        )

        db.session.add(category)
        db.session.commit()

        return jsonify(category.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create category'}), 500

@faq_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    try:
        current_user_id = get_jwt_identity()
        category = Category.query.get(category_id)

        if not category:
            return jsonify({'error': 'Category not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Update fields
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'icon' in data:
            category.icon = data['icon']
        if 'color' in data:
            category.color = data['color']
        if 'order' in data:
            category.order = data['order']
        if 'is_active' in data:
            category.is_active = data['is_active']

        db.session.commit()
        return jsonify(category.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update category'}), 500

@faq_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        total_faqs = FAQ.query.filter_by(is_active=True).count()
        total_categories = Category.query.filter_by(is_active=True).count()

        # FAQs per category
        category_stats = db.session.query(
            FAQ.category,
            db.func.count(FAQ.id)
        ).filter_by(is_active=True).group_by(FAQ.category).all()

        return jsonify({
            'total_faqs': total_faqs,
            'total_categories': total_categories,
            'category_breakdown': [
                {'category': stat[0], 'count': stat[1]}
                for stat in category_stats
            ]
        })

    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats'}), 500