# Nodeflux FAQ System

Full-stack FAQ system untuk troubleshooting produk Nodeflux VisionAI.

## Architecture

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Python Flask + SQLAlchemy + JWT Authentication
- **Database**: SQLite (development) / PostgreSQL (production)
- **Admin Panel**: React dengan authentication

## Project Structure

```
faq-nodeflux/
├── backend/          # Flask API backend
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   ├── requirements.txt
│   ├── config.py
│   ├── .env.example
│   └── .env
├── frontend/         # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── package.json      # Root package.json for dev scripts
├── SECURITY.md       # Security guidelines
└── README.md
```

## Quick Start

### Using Root Scripts (Recommended)

```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access

- **FAQ Public**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Base**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Admin Credentials

🚨 **Security Note**: Default credentials are configured in `.env` file.

**Development Default:**
- Username: `admin`
- Password: `SecureAdmin123!` (configured in `.env`)

⚠️ **Change these before production deployment!**

## Features

### ✅ Implemented
- JWT-based authentication
- FAQ CRUD operations
- Category management
- Search & filtering
- Admin dashboard
- Responsive design
- Environment-based configuration

### 🚧 Development Features
- Rich text editor for FAQ answers
- File upload support
- User management
- Bulk operations
- Advanced search

## Security

See [SECURITY.md](./SECURITY.md) for security guidelines and best practices.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///faq.db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecureAdmin123!
ADMIN_EMAIL=admin@nodeflux.io
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Axios
- **Backend**: Python 3.11+, Flask, SQLAlchemy, Flask-JWT-Extended, bcrypt
- **DevTools**: Concurrently, ESLint, Git