# Production Deployment Guide

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL (recommended for production) or SQLite (development)

## Backend Setup

1. **Install dependencies:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set environment variables:**
Create a `.env` file in the root directory (see `env.production` for template):
```env
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=voucher.mysa.my
CORS_ALLOWED_ORIGINS=https://voucher.mysa.my
CSRF_TRUSTED_ORIGINS=https://voucher.mysa.my
SECURE_SSL_REDIRECT=True
```

3. **Run migrations:**
```bash
python manage.py migrate
```

4. **Collect static files:**
```bash
python manage.py collectstatic --noinput
```

5. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

## Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Set environment variables:**
Create a `.env.production` file in the `frontend` directory:
```env
VITE_API_BASE_URL=https://voucher.mysa.my/api
```

3. **Build for production:**
```bash
npm run build
```

The built files will be in `frontend/dist/` directory.

## Production Server (Django)

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

Or use a reverse proxy with Nginx.

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use a strong `SECRET_KEY` (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Configure HTTPS/SSL
- [ ] Update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` with production URLs
- [ ] Use a production database (PostgreSQL recommended)
- [ ] Set up proper logging
- [ ] Configure static file serving (Nginx or CDN)
- [ ] Set up error monitoring (Sentry, etc.)

## Environment Variables Reference

### Backend (.env)
- `SECRET_KEY`: Django secret key (required for production)
- `DEBUG`: Set to `False` in production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of CORS origins
- `CSRF_TRUSTED_ORIGINS`: Comma-separated list of CSRF trusted origins

### Frontend (.env.production)
- `VITE_API_BASE_URL`: API base URL (e.g., `https://api.yourdomain.com/api`)

