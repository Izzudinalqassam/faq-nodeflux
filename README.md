# Nodeflux FAQ System

Full-stack FAQ system untuk troubleshooting produk Nodeflux VisionAI.

## Architecture

- **Frontend**: React + TailwindCSS
- **Backend**: Python Flask + SQLAlchemy
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
│   └── config.py
├── frontend/         # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Running

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Access:
- FAQ Public: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- API: http://localhost:5000

## Default Admin

- Username: admin
- Password: admin123