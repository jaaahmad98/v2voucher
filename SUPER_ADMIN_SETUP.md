# Super Admin Excel Upload Feature - Setup Guide

## Overview
The super admin feature allows users with the `super_admin` role to upload Excel files to replace the voucher batch file (`voucher_barcode_with_serial.xlsx`).

## Setup Instructions

### 1. Database Migration
The migration has already been applied. If you need to apply it manually:
```bash
python manage.py migrate
```

### 2. Set a User as Super Admin

You have three options to set a user as super admin:

#### Option A: Using Management Command (Recommended)
```bash
python manage.py set_super_admin <username>
```

Example:
```bash
python manage.py set_super_admin admin
```

#### Option B: Using Django Admin Interface
1. Go to `http://localhost:8000/admin/`
2. Navigate to **API > User profiles**
3. Find the user you want to make super admin
4. Edit the user profile and set **Role** to "Super Admin"
5. Save

#### Option C: Using Django Shell
```python
python manage.py shell
```
```python
from django.contrib.auth.models import User
from api.models import UserProfile

user = User.objects.get(username='your_username')
user_profile, created = UserProfile.objects.get_or_create(user=user)
user_profile.role = 'super_admin'
user_profile.save()
```

### 3. Using the Feature

1. **Login as Super Admin**: Log in to the application with a super admin account
2. **Access Admin Panel**: The admin panel will appear at the bottom of the dashboard (only visible to super admins)
3. **Upload Excel File**:
   - Click "Choose File" and select an Excel file (.xlsx or .xls)
   - The file must contain a column named "barcode" (case-insensitive)
   - Click "Muat Naik Fail" (Upload File)
   - The uploaded file will be stored as `voucher_barcode_with_serial.xlsx`

### 4. Automatic Voucher Assignment

**When a user registers:**
- The system automatically reads from `voucher_barcode_with_serial.xlsx`
- It finds the first unused voucher code (not already assigned to any user)
- The voucher code is automatically assigned to the newly registered user
- Each user gets a unique voucher code from the Excel file
- If all codes are used, registration will fail with an error message

### Excel File Format

The Excel file must:
- Be in `.xlsx` or `.xls` format
- Contain a column named "barcode" (case-insensitive)
- Have at least one barcode value in the barcode column
- Example structure:
  ```
  | barcode    |
  |------------|
  | CODE001    |
  | CODE002    |
  | CODE003    |
  ```

### API Endpoint

**POST** `/api/vouchers/upload_batch/`

**Authentication**: Required (Super Admin only)

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "message": "Fail Excel berjaya dimuat naik. 100 kod barcode tersedia.",
  "total_codes": 100
}
```

### Security

- Only users with `role = 'super_admin'` can access the upload endpoint
- The endpoint validates:
  - File format (must be .xlsx or .xls)
  - Excel structure (must have 'barcode' column)
  - At least one barcode value must exist

### Troubleshooting

**Issue**: Admin panel not showing
- **Solution**: Ensure the user's role is set to `'super_admin'` in the UserProfile

**Issue**: Upload fails with "Fail Excel mesti mengandungi lajur 'barcode'"
- **Solution**: Ensure your Excel file has a column named "barcode" (case-insensitive)

**Issue**: Permission denied (403)
- **Solution**: The user must have `role = 'super_admin'` in their UserProfile

**Issue**: User registration fails with "Semua kod voucher telah digunakan"
- **Solution**: Upload a new Excel file with more voucher codes using the super admin panel

**Issue**: User registration fails with "Fail Excel tidak ditemui"
- **Solution**: Ensure `voucher_barcode_with_serial.xlsx` exists in the project root directory. Upload it via super admin panel if missing.

