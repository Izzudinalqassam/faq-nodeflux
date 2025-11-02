from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, User, FAQ, Category
from routes.auth import auth_bp
from routes.faq import faq_bp
from config import config
import os

def create_app(config_name=None):
    app = Flask(__name__)

    # Load config
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')

    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(faq_bp, url_prefix='/api')

    # Create database tables
    with app.app_context():
        db.create_all()

        # Create default admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', is_admin=True)
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

        # Create default categories if not exists
        default_categories = [
            {
                'name': 'installation',
                'description': 'Panduan instalasi dan setup awal',
                'icon': 'fas fa-download',
                'color': '#2563eb',
                'order': 1
            },
            {
                'name': 'connection',
                'description': 'Masalah jaringan dan API',
                'icon': 'fas fa-network-wired',
                'color': '#f59e0b',
                'order': 2
            },
            {
                'name': 'performance',
                'description': 'Optimasi dan troubleshooting',
                'icon': 'fas fa-tachometer-alt',
                'color': '#10b981',
                'order': 3
            },
            {
                'name': 'detection',
                'description': 'Face recognition, PPE, LPR',
                'icon': 'fas fa-eye',
                'color': '#ef4444',
                'order': 4
            }
        ]

        for cat_data in default_categories:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(**cat_data)
                db.session.add(category)

        # Create sample FAQs if not exists
        sample_faqs = [
            {
                'question': 'Bagaimana cara instalasi VisionAIre Stream?',
                'answer': '<p>Untuk instalasi VisionAIre Stream, ikuti langkah berikut:</p><div class="code-block"># Download package<br>wget https://releases.nodeflux.io/visionaire-stream/latest.tar.gz<br><br># Extract<br>tar -xzf latest.tar.gz<br>cd visionaire-stream<br><br># Setup configuration<br>cp config.example.yaml config.yaml<br><br># Run dengan Docker Compose<br>docker-compose up -d</div><p>Access http://localhost:8080 untuk verifikasi.</p>',
                'category': 'installation',
                'tags': 'installation,visionaire stream,docker,setup',
                'order': 1
            },
            {
                'question': 'Kenapa API connection timeout/failed?',
                'answer': '<p><strong>Common causes:</strong></p><ul><li>Check firewall settings (port 8080, 443)</li><li>Verify internet connectivity</li><li>Ping ke API endpoint</li><li>Check API key validity</li></ul><div class="code-block"># Test connection<br>curl -I https://api.nodeflux.io/v1/health</div>',
                'category': 'connection',
                'tags': 'api,connection,timeout,troubleshooting',
                'order': 1
            },
            {
                'question': 'Bagaimana optimasi performa VisionAIre?',
                'answer': '<p><strong>Performance Optimization:</strong></p><ul><li>Use SSD untuk storage</li><li>Enable GPU acceleration</li><li>Allocate sufficient RAM</li><li>Use multi-core CPU</li></ul><div class="code-block"># GPU Configuration<br>gpu:<br>  enabled: true<br>  device_id: 0<br>  memory_fraction: 0.8</div>',
                'category': 'performance',
                'tags': 'performance,optimization,gpu,memory',
                'order': 1
            },
            {
                'question': 'Face recognition accuracy rendah?',
                'answer': '<p><strong>Improve Face Recognition:</strong></p><ul><li>Minimum face size: 100x100 pixels</li><li>Good lighting (no shadows)</li><li>Face angle: -30° to +30°</li><li>No occlusion (masks, glasses)</li></ul><p>Use quality reference images dan regular model retraining.</p>',
                'category': 'detection',
                'tags': 'face recognition,accuracy,ai,detection',
                'order': 1
            }
        ]

        for faq_data in sample_faqs:
            if not FAQ.query.filter_by(question=faq_data['question']).first():
                # Find admin user
                admin_user = User.query.filter_by(username='admin').first()
                faq_data['created_by'] = admin_user.id if admin_user else 1
                faq = FAQ(**faq_data)
                db.session.add(faq)

        db.session.commit()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'message': 'Nodeflux FAQ API is running'}

    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)