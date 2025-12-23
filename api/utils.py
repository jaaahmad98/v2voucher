import pandas as pd
from django.conf import settings
from .models import Voucher

def get_available_voucher_code():
    """
    Reads voucher codes from Excel file and returns an unused code.
    Raises ValueError if no codes are available.
    """
    excel_file_path = settings.BASE_DIR / 'voucher_barcode_with_serial.xlsx'
    
    try:
        # Read the Excel file
        df = pd.read_excel(excel_file_path)
        
        # Get column name (case-insensitive search for 'barcode')
        barcode_column = None
        for col in df.columns:
            if col.lower() == 'barcode':
                barcode_column = col
                break
        
        if barcode_column is None:
            raise ValueError("Fail Excel mesti mengandungi lajur 'barcode'")
        
        # Get all barcode values from the 'barcode' column
        available_codes = df[barcode_column].dropna().tolist()
        
        # Get all codes that are already used in the database
        used_codes = set(Voucher.objects.values_list('code', flat=True))
        
        # Find the first available (unused) code
        for code in available_codes:
            code_str = str(code).strip()  # Convert to string and strip whitespace
            if code_str not in used_codes:
                return code_str
        
        # If all codes are used, raise an error
        raise ValueError("Semua kod voucher telah digunakan. Tiada kod lagi tersedia.")
        
    except FileNotFoundError:
        raise FileNotFoundError(f"Fail Excel tidak ditemui di {excel_file_path}")
    except Exception as e:
        raise Exception(f"Ralat membaca fail Excel: {e}")

