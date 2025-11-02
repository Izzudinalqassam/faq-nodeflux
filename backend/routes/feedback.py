from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, FAQRating, FAQFeedback, FAQ
from datetime import datetime
import ipaddress

feedback_bp = Blueprint('feedback', __name__)

def get_client_ip():
    """Get client IP address from request"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

@feedback_bp.route('/faqs/<int:faq_id>/rating', methods=['POST'])
def add_faq_rating(faq_id):
    """Add or update rating for a FAQ"""
    try:
        # Check if FAQ exists
        faq = FAQ.query.get_or_404(faq_id)

        data = request.get_json()
        rating = data.get('rating')

        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400

        client_ip = get_client_ip()
        user_id = None

        # Try to get user ID if authenticated
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request()
            user_id = get_jwt_identity()
        except:
            pass

        # Check if user/IP already rated this FAQ
        existing_rating = FAQRating.query.filter_by(
            faq_id=faq_id,
            ip_address=client_ip
        ).first()

        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating
            existing_rating.created_at = datetime.utcnow()
            db.session.commit()
            rating_data = existing_rating.to_dict()
        else:
            # Create new rating
            new_rating = FAQRating(
                faq_id=faq_id,
                rating=rating,
                user_id=user_id,
                ip_address=client_ip
            )
            db.session.add(new_rating)
            db.session.commit()
            rating_data = new_rating.to_dict()

        # Return updated rating stats
        ratings = [r.rating for r in faq.ratings]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            rating_dist[r] += 1

        return jsonify({
            'rating': rating_data,
            'stats': {
                'average_rating': round(avg_rating, 1),
                'total_ratings': len(ratings),
                'rating_distribution': rating_dist
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/faqs/<int:faq_id>/feedback', methods=['POST'])
def add_faq_feedback(faq_id):
    """Submit feedback for a FAQ"""
    try:
        # Check if FAQ exists
        faq = FAQ.query.get_or_404(faq_id)

        data = request.get_json()
        feedback_text = data.get('feedback_text', '').strip()
        contact_email = data.get('contact_email', '').strip()
        rating_id = data.get('rating_id')
        is_helpful = data.get('is_helpful', True)

        if not feedback_text:
            return jsonify({'error': 'Feedback text is required'}), 400

        # Validate email if provided
        if contact_email and '@' not in contact_email:
            return jsonify({'error': 'Invalid email address'}), 400

        client_ip = get_client_ip()
        user_id = None

        # Try to get user ID if authenticated
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request()
            user_id = get_jwt_identity()
        except:
            pass

        # Create new feedback
        new_feedback = FAQFeedback(
            faq_id=faq_id,
            rating_id=rating_id,
            feedback_text=feedback_text,
            contact_email=contact_email,
            user_id=user_id,
            ip_address=client_ip,
            is_helpful=is_helpful
        )

        db.session.add(new_feedback)
        db.session.commit()

        return jsonify(new_feedback.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/faqs/<int:faq_id>/ratings', methods=['GET'])
def get_faq_ratings(faq_id):
    """Get all ratings for a FAQ (admin only)"""
    try:
        # Check if FAQ exists
        faq = FAQ.query.get_or_404(faq_id)

        # For now, return only stats (public)
        ratings = [r.rating for r in faq.ratings]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            rating_dist[r] += 1

        return jsonify({
            'average_rating': round(avg_rating, 1),
            'total_ratings': len(ratings),
            'rating_distribution': rating_dist
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/faqs/<int:faq_id>/feedbacks', methods=['GET'])
def get_faq_feedbacks(faq_id):
    """Get feedback for a FAQ (admin only)"""
    try:
        # For now, this endpoint requires admin auth
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        verify_jwt_in_request()

        # Check if user is admin
        from models import User
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403

        # Check if FAQ exists
        faq = FAQ.query.get_or_404(faq_id)

        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Query feedbacks
        feedbacks = FAQFeedback.query.filter_by(faq_id=faq_id)\
            .order_by(FAQFeedback.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'feedbacks': [feedback.to_dict() for feedback in feedbacks.items],
            'pagination': {
                'page': feedbacks.page,
                'per_page': feedbacks.per_page,
                'total': feedbacks.total,
                'pages': feedbacks.pages,
                'has_next': feedbacks.has_next,
                'has_prev': feedbacks.has_prev
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500