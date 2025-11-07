from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import FAQ, Category, User, FAQRating, FAQFeedback, Attachment, db
from datetime import datetime

faq_bp = Blueprint('faq', __name__)

@faq_bp.route('/faqs', methods=['GET'])
def get_faqs():
    try:
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search', '').lower()
        tags = request.args.get('tags', '').split(',') if request.args.get('tags') else []
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        created_by = request.args.get('created_by')
        has_attachments = request.args.get('has_attachments', type=bool)
        min_rating = request.args.get('min_rating', type=int)
        sort_by = request.args.get('sort_by', 'order')
        sort_order = request.args.get('sort_order', 'asc')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Start query
        query = FAQ.query.filter_by(is_active=True)

        # Apply filters
        if category and category != 'all':
            query = query.filter_by(category=category)

        if search:
            query = query.filter(
                db.or_(
                    FAQ.question.ilike(f'%{search}%'),
                    FAQ.answer.ilike(f'%{search}%'),
                    FAQ.tags.ilike(f'%{search}%')
                )
            )

        if tags:
            for tag in tags:
                if tag.strip():
                    query = query.filter(FAQ.tags.ilike(f'%{tag.strip()}%'))

        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                query = query.filter(FAQ.created_at >= date_from_obj)
            except ValueError:
                pass

        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
                # Add one day to make it inclusive
                date_to_obj = date_to_obj.replace(hour=23, minute=59, second=59)
                query = query.filter(FAQ.created_at <= date_to_obj)
            except ValueError:
                pass

        if created_by:
            # Search by username or email
            user_query = User.query.filter(
                db.or_(
                    User.username.ilike(f'%{created_by}%'),
                    User.email.ilike(f'%{created_by}%')
                )
            ).first()
            if user_query:
                query = query.filter_by(created_by=user_query.id)

        if has_attachments:
            query = query.join(Attachment).filter(Attachment.id.isnot(None)).distinct()

        if min_rating and min_rating > 0:
            # Join with ratings and filter by average rating
            query = query.outerjoin(FAQRating).group_by(FAQ.id).having(
                db.func.avg(FAQRating.rating) >= min_rating
            )

        # Apply sorting
        if sort_by == 'newest':
            query = query.order_by(FAQ.created_at.desc())
        elif sort_by == 'oldest':
            query = query.order_by(FAQ.created_at.asc())
        elif sort_by == 'rating':
            query = query.outerjoin(FAQRating).group_by(FAQ.id).order_by(
                db.func.avg(FAQRating.rating).desc() if sort_order == 'desc' else db.func.avg(FAQRating.rating).asc()
            )
        elif sort_by == 'views':
            # TODO: View sorting temporarily disabled
            query = query.order_by(FAQ.created_at.desc() if sort_order == 'desc' else FAQ.created_at.asc())
        elif sort_by == 'relevance' and search:
            # Simple relevance scoring based on search term positions
            query = query.order_by(
                FAQ.question.ilike(f'%{search}%').desc(),
                FAQ.created_at.desc()
            )
        else:
            # Default sorting by order
            query = query.order_by(FAQ.order.asc() if sort_order == 'asc' else FAQ.order.desc())

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
        print(f"Error in get_faqs: {e}")
        return jsonify({'error': 'Failed to fetch FAQs'}), 500

@faq_bp.route('/faqs', methods=['POST'])
@jwt_required()
def create_faq():
    try:
        current_user_id = int(get_jwt_identity())
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

        # TODO: Increment view count - temporarily disabled
        # faq.view_count = (faq.view_count or 0) + 1
        # db.session.commit()

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
        current_user_id = int(get_jwt_identity())
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

@faq_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    try:
        current_user_id = int(get_jwt_identity())
        category = Category.query.get(category_id)

        if not category:
            return jsonify({'error': 'Category not found'}), 404

        # Check if category has FAQs
        faq_count = FAQ.query.filter_by(category=category.name, is_active=True).count()
        if faq_count > 0:
            return jsonify({
                'error': f'Cannot delete category with {faq_count} active FAQs. Please reassign or delete the FAQs first.'
            }), 400

        # Soft delete
        category.is_active = False
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete category'}), 500

@faq_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        # Basic counts
        total_faqs = FAQ.query.filter_by(is_active=True).count()
        total_categories = Category.query.filter_by(is_active=True).count()
        total_ratings = db.session.query(FAQRating).count()
        total_feedbacks = db.session.query(FAQFeedback).count()
        total_attachments = db.session.query(Attachment).count()

        # Simple stats - avoid complex queries for now
        return jsonify({
            'overview': {
                'total_faqs': total_faqs,
                'total_categories': total_categories,
                'total_ratings': total_ratings,
                'total_feedbacks': total_feedbacks,
                'total_attachments': total_attachments
            },
            'category_breakdown': [],
            'monthly_stats': [],
            'top_rated': [],
            'most_viewed': [],
            'recent_activity': []
        })

    except Exception as e:
        print(f"Stats error: {e}")
        return jsonify({'error': 'Failed to fetch stats'}), 500