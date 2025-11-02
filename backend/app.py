from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models import db, User, FAQ, Category, Attachment, FAQRating, FAQFeedback
from routes.auth import auth_bp
from routes.faq import faq_bp
from routes.upload import upload_file, serve_file, delete_file
from routes.feedback import feedback_bp
from config import config
import os

# Load environment variables
load_dotenv()

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
    app.register_blueprint(feedback_bp, url_prefix='/api')

    # Upload routes
    app.route('/api/upload', methods=['POST'])(upload_file)
    app.route('/api/uploads/<filename>')(serve_file)
    app.route('/api/upload/<int:file_id>', methods=['DELETE'])(delete_file)

    # Create database tables
    with app.app_context():
        db.create_all()

        # Create default admin user if not exists
        if app.config.get('ADMIN_USERNAME') and app.config.get('ADMIN_PASSWORD'):
            if not User.query.filter_by(username=app.config['ADMIN_USERNAME']).first():
                admin = User(
                    username=app.config['ADMIN_USERNAME'],
                    is_admin=True,
                    email=app.config.get('ADMIN_EMAIL')
                )
                admin.set_password(app.config['ADMIN_PASSWORD'])
                db.session.add(admin)
                print(f"Created admin user: {app.config['ADMIN_USERNAME']}")
            else:
                print(f"Admin user already exists: {app.config['ADMIN_USERNAME']}")
        else:
            print("Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env file")

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
                'answer': '''Untuk instalasi VisionAIre Stream, ikuti langkah berikut:

```bash
# Download package
wget https://releases.nodeflux.io/visionaire-stream/latest.tar.gz

# Extract
tar -xzf latest.tar.gz
cd visionaire-stream

# Setup configuration
cp config.example.yaml config.yaml

# Run dengan Docker Compose
docker-compose up -d
```

Access http://localhost:8080 untuk verifikasi.''',
                'category': 'installation',
                'tags': 'installation,visionaire stream,docker,setup',
                'order': 1
            },
            {
                'question': 'Kenapa API connection timeout/failed?',
                'answer': '''**Common causes:**

- Check firewall settings (port 8080, 443)
- Verify internet connectivity
- Ping ke API endpoint
- Check API key validity

```bash
# Test connection
curl -I https://api.nodeflux.io/v1/health
```''',
                'category': 'connection',
                'tags': 'api,connection,timeout,troubleshooting',
                'order': 1
            },
            {
                'question': 'Bagaimana optimasi performa VisionAIre?',
                'answer': '''**Performance Optimization:**

- Use SSD untuk storage
- Enable GPU acceleration
- Allocate sufficient RAM
- Use multi-core CPU

```yaml
# GPU Configuration
gpu:
  enabled: true
  device_id: 0
  memory_fraction: 0.8
```''',
                'category': 'performance',
                'tags': 'performance,optimization,gpu,memory',
                'order': 1
            },
            {
                'question': 'Face recognition accuracy rendah?',
                'answer': '''**Improve Face Recognition:**

- Minimum face size: 100x100 pixels
- Good lighting (no shadows)
- Face angle: -30° to +30°
- No occlusion (masks, glasses)

Use quality reference images dan regular model retraining.''',
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