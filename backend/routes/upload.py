import os
import uuid
from flask import request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
import mimetypes
from models import db, Attachment

ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(mime_type):
    if mime_type.startswith('image/'):
        return 'image'
    elif mime_type in ['application/pdf', 'text/plain',
                       'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        return 'document'
    else:
        return 'other'

@jwt_required()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 400

        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"

        # Determine upload directory and mime type
        mime_type, _ = mimetypes.guess_type(original_filename)
        if not mime_type:
            # Fallback based on extension
            if file_extension in ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']:
                mime_type = f'image/{file_extension}'
            elif file_extension == 'pdf':
                mime_type = 'application/pdf'
            else:
                mime_type = 'application/octet-stream'

        file_type = get_file_type(mime_type)

        if file_type == 'image':
            upload_dir = 'uploads/images'
        else:
            upload_dir = 'uploads/documents'

        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)

        # Process images
        if file_type == 'image':
            try:
                with Image.open(file_path) as img:
                    # Resize large images
                    if img.width > 1920 or img.height > 1080:
                        img.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
                        img.save(file_path, optimize=True, quality=85)
            except Exception as e:
                print(f"Error processing image: {e}")

        # Save to database
        attachment = Attachment(
            filename=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            file_type=file_type
        )
        db.session.add(attachment)
        db.session.commit()

        return jsonify({
            'id': attachment.id,
            'filename': unique_filename,
            'original_filename': original_filename,
            'file_type': file_type,
            'mime_type': mime_type,
            'file_size': file_size,
            'url': f'/api/uploads/{unique_filename}'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def serve_file(filename):
    try:
        # Find file in database
        attachment = Attachment.query.filter_by(filename=filename).first()
        if not attachment:
            return jsonify({'error': 'File not found'}), 404

        return send_from_directory(
            os.path.dirname(attachment.file_path),
            attachment.filename,
            as_attachment=False
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jwt_required()
def delete_file(file_id):
    try:
        attachment = Attachment.query.get_or_404(file_id)

        # Delete physical file
        if os.path.exists(attachment.file_path):
            os.remove(attachment.file_path)

        # Delete from database
        db.session.delete(attachment)
        db.session.commit()

        return jsonify({'message': 'File deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500