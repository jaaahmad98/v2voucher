# Frontend vs Backend API Endpoint Comparison

## Authentication Endpoints

| Frontend Call | Frontend URL | HTTP Method | Backend URL | Backend View | HTTP Method | Status |
|---------------|--------------|-------------|-------------|--------------|-------------|--------|
| `authAPI.register()` | `/auth/register/` | POST | `auth/register/` | `register_view` | POST | ✅ Match |
| `authAPI.login()` | `/auth/login/` | POST | `auth/login/` | `login_view` | POST | ✅ Match |
| `authAPI.logout()` | `/auth/logout/` | POST | `auth/logout/` | `logout_view` | POST | ✅ Match |
| `authAPI.getCurrentUser()` | `/auth/me/` | GET | `auth/me/` | `current_user_view` | GET | ✅ Match |

## Voucher Endpoints

| Frontend Call | Frontend URL | HTTP Method | Backend URL | Backend View | HTTP Method | Status |
|---------------|--------------|-------------|-------------|--------------|-------------|--------|
| `voucherAPI.getVoucher()` | `/vouchers/` | GET | `vouchers/` | `VoucherViewSet.list()` | GET | ✅ Match |
| `voucherAPI.useVoucher()` | `/vouchers/use_voucher/` | POST | `vouchers/use_voucher/` | `VoucherViewSet.use_voucher()` | POST | ✅ Match |

## Detailed Verification

### 1. Authentication Endpoints

**✅ All authentication endpoints match perfectly.**

- **Register**: Frontend calls `POST /auth/register/` → Backend has `path('auth/register/', register_view)` with `@api_view(['POST'])`
- **Login**: Frontend calls `POST /auth/login/` → Backend has `path('auth/login/', login_view)` with `@api_view(['POST'])`
- **Logout**: Frontend calls `POST /auth/logout/` → Backend has `path('auth/logout/', logout_view)` with `@api_view(['POST'])`
- **Get Current User**: Frontend calls `GET /auth/me/` → Backend has `path('auth/me/', current_user_view)` with `@api_view(['GET'])`

### 2. Voucher Endpoints

**✅ All voucher endpoints match perfectly.**

Django REST Framework ViewSet routing:
- **Get Voucher**: Frontend calls `GET /vouchers/` → Backend ViewSet's `list()` method handles GET requests to `/vouchers/`
- **Use Voucher**: Frontend calls `POST /vouchers/use_voucher/` → Backend ViewSet's `use_voucher()` method is decorated with `@action(detail=False, methods=['post'])`, which creates the endpoint `/vouchers/use_voucher/`

## Conclusion

**✅ ALL ENDPOINTS MATCH CORRECTLY**

All frontend API calls are correctly aligned with backend routes:
- All URL paths match
- All HTTP methods match
- All endpoints are properly configured

No discrepancies found!

