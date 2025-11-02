# Security Guidelines

## Environment Configuration

This application uses environment variables for security. Copy `.env.example` to `.env` and configure:

```bash
# Critical - Change in production
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMAIL=admin@yourcompany.com

# Database
DATABASE_URL=sqlite:///faq.db  # Change to PostgreSQL in production
```

## Security Features

### ✅ Implemented
- Environment-based configuration
- Password hashing with bcrypt
- JWT authentication
- CORS configuration
- Basic input validation

### 🚧 In Development
- Rate limiting
- CSRF protection
- Input sanitization
- Security headers
- Audit logging

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** and change defaults
3. **Enable HTTPS** in production
4. **Regularly update dependencies**
5. **Implement rate limiting** for API endpoints
6. **Use PostgreSQL** instead of SQLite in production

## Default Credentials

**Development:**
- Username: `admin`
- Password: `SecureAdmin123!` (configured in `.env`)

⚠️ **Change these before production deployment!**