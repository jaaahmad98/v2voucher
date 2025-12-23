# Production Configuration for voucher.mysa.my

## Summary of Changes

All production settings have been configured for **voucher.mysa.my** domain.

## ✅ Completed Configuration

### Backend (Django)

1. **DEBUG = False** (default)
   - Set in `core/settings.py`
   - Can be overridden with `DEBUG=True` in `.env` if needed

2. **ALLOWED_HOSTS**
   - Default: `['voucher.mysa.my']`
   - Configurable via `.env`: `ALLOWED_HOSTS=voucher.mysa.my`

3. **CORS Settings**
   - Removed all localhost references
   - Default: `['https://voucher.mysa.my']`
   - Configurable via `.env`: `CORS_ALLOWED_ORIGINS=https://voucher.mysa.my`

4. **CSRF Trusted Origins**
   - Removed all localhost references
   - Default: `['https://voucher.mysa.my']`
   - Configurable via `.env`: `CSRF_TRUSTED_ORIGINS=https://voucher.mysa.my`

5. **Security Headers** (when DEBUG=False)
   - SSL Redirect enabled
   - Secure cookies
   - HSTS enabled
   - XSS protection
   - Content type sniffing protection

6. **Static Files**
   - STATIC_ROOT configured for production

### Frontend (React/Vite)

1. **API Base URL**
   - Default: `https://voucher.mysa.my/api`
   - Configurable via `.env.production`: `VITE_API_BASE_URL`

2. **Error Messages**
   - Removed localhost references

## Environment Files

### Backend `.env` file (create on production server):

```env
SECRET_KEY=h#@zsnnnc2vtn&!qaul#bosc_mo+#c9)l-f(!h2j&mdm@9qzzq
DEBUG=False
ALLOWED_HOSTS=voucher.mysa.my
CORS_ALLOWED_ORIGINS=https://voucher.mysa.my
CSRF_TRUSTED_ORIGINS=https://voucher.mysa.my
SECURE_SSL_REDIRECT=True
```

### Frontend `.env.production` file (create on production server):

```env
VITE_API_BASE_URL=https://voucher.mysa.my/api
```

## Deployment Notes

1. **API Endpoint**: The frontend expects the API at `https://voucher.mysa.my/api`
   - Ensure your Django server is accessible at this URL
   - Or update `VITE_API_BASE_URL` if using a different API domain

2. **HTTPS Required**: All production settings assume HTTPS
   - SSL certificates must be configured
   - Security headers will enforce HTTPS

3. **Static Files**: Run `python manage.py collectstatic` before deploying

4. **Build Frontend**: Run `npm run build` in the frontend directory

## Verification

✅ Django system check passed with no issues
✅ All localhost references removed
✅ DEBUG defaults to False
✅ Production domain configured: voucher.mysa.my

