# Production Readiness Checklist

## Before Deploying

### Backend (Django)
- [ ] Set `DEBUG=False` in environment variables
- [ ] Generate a new `SECRET_KEY` for production (use: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- [ ] Update `ALLOWED_HOSTS` with production domain(s)
- [ ] Configure database (PostgreSQL recommended for production)
- [ ] Update `CORS_ALLOWED_ORIGINS` with production frontend URL
- [ ] Update `CSRF_TRUSTED_ORIGINS` with production frontend URL
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Set up proper logging configuration
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up error monitoring (Sentry, etc.)

### Frontend (React/Vite)
- [ ] Set `VITE_API_BASE_URL` in `.env.production` to production API URL
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally
- [ ] Configure proper caching headers
- [ ] Set up CDN for static assets (if applicable)

### Security
- [ ] All environment variables are set correctly
- [ ] No sensitive data in code
- [ ] HTTPS is configured
- [ ] CORS is properly configured
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured (if needed)
- [ ] Input validation is in place
- [ ] SQL injection protection (using Django ORM)
- [ ] XSS protection (Django templates escape by default)

### Performance
- [ ] Database queries are optimized
- [ ] Static files are served efficiently (CDN/Nginx)
- [ ] Frontend assets are minified and optimized
- [ ] Caching is configured
- [ ] Database indexing is set up

### Monitoring & Logging
- [ ] Error logging is configured
- [ ] Application monitoring is set up
- [ ] Health check endpoint is available
- [ ] Log rotation is configured

## Quick Production Setup

1. **Backend:**
```bash
# Set environment variables
export SECRET_KEY="your-production-secret-key"
export DEBUG="False"
export ALLOWED_HOSTS="yourdomain.com"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com"

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

2. **Frontend:**
```bash
cd frontend

# Set environment variable
echo "VITE_API_BASE_URL=https://api.yourdomain.com/api" > .env.production

# Install dependencies
npm install

# Build for production
npm run build
```

3. **Run Production Server:**
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Environment Variables Template

### Backend `.env`
```env
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

### Frontend `.env.production`
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

