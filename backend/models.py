from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash)

class FAQ(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    tags = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, default=0)
    # view_count = db.Column(db.Integer, default=0)  # Temporarily disabled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    attachments = db.relationship('Attachment', backref='faq', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        # Calculate rating statistics
        ratings = [r.rating for r in self.ratings]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            rating_dist[r] += 1

        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'is_active': self.is_active,
            'order': self.order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'attachments': [
                {
                    'id': att.id,
                    'url': f'/api/uploads/{att.filename}',
                    'filename': att.filename,
                    'original_filename': att.original_filename,
                    'file_type': att.file_type,
                    'file_size': att.file_size,
                    'mime_type': att.mime_type
                }
                for att in self.attachments or []
            ],
            'rating_stats': {
                'average_rating': round(avg_rating, 1),
                'total_ratings': len(ratings),
                'rating_distribution': rating_dist
            }
        }

class Attachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    file_type = db.Column(db.String(20))  # 'image', 'document', 'other'
    faq_id = db.Column(db.Integer, db.ForeignKey('faq.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    icon = db.Column(db.String(50))
    color = db.Column(db.String(20))
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'order': self.order,
            'is_active': self.is_active
        }

class FAQRating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faq_id = db.Column(db.Integer, db.ForeignKey('faq.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    ip_address = db.Column(db.String(45), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    faq = db.relationship('FAQ', backref=db.backref('ratings', lazy='dynamic', cascade='all, delete-orphan'))
    user = db.relationship('User', backref='ratings')

    def to_dict(self):
        return {
            'id': self.id,
            'faq_id': self.faq_id,
            'rating': self.rating,
            'user_id': self.user_id,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }

class FAQFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faq_id = db.Column(db.Integer, db.ForeignKey('faq.id'), nullable=False)
    rating_id = db.Column(db.Integer, db.ForeignKey('faq_rating.id'), nullable=True)
    feedback_text = db.Column(db.Text, nullable=False)
    contact_email = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    ip_address = db.Column(db.String(45), nullable=False)
    is_helpful = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    faq = db.relationship('FAQ', backref=db.backref('feedbacks', lazy='dynamic', cascade='all, delete-orphan'))
    rating = db.relationship('FAQRating', backref='feedbacks')
    user = db.relationship('User', backref='feedbacks')

    def to_dict(self):
        return {
            'id': self.id,
            'faq_id': self.faq_id,
            'rating_id': self.rating_id,
            'feedback_text': self.feedback_text,
            'contact_email': self.contact_email,
            'user_id': self.user_id,
            'ip_address': self.ip_address,
            'is_helpful': self.is_helpful,
            'created_at': self.created_at.isoformat()
        }