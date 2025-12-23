# V2 Voucher Application

A voucher management system with user registration, authentication, and voucher generation with barcode support.

## Features

- User registration and authentication
- Voucher generation with unique codes
- Barcode generation for vouchers
- Modern, responsive UI with Malay language support
- Canggih brand styling

## Tech Stack

### Backend
- Django 6.0
- Django REST Framework
- SQLite (development) / PostgreSQL (production)

### Frontend
- React 19
- Vite
- Tailwind CSS
- JsBarcode

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py migrate
```

4. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

5. **Run development server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for a comprehensive production readiness checklist.

## Project Structure

```
.
├── api/                  # Django API app
│   ├── models.py        # UserProfile, Voucher models
│   ├── views.py         # API endpoints
│   ├── serializers.py   # DRF serializers
│   └── urls.py          # API URL routing
├── core/                 # Django project settings
│   ├── settings.py      # Django settings
│   └── urls.py          # Main URL configuration
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   └── api.js       # API client
│   └── public/          # Static assets
└── manage.py            # Django management script
```

## Color Scheme

The application uses the following brand colors:
- 60% - `#efeddd` (Light Beige - Background)
- 30% - `#ed1e24` (Red - Primary actions)
- 10% - `#1b3292` (Dark Blue - Accents)

## License

This project is proprietary software.

