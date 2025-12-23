from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import pandas as pd
from .models import Voucher
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserRegistrationSerializer, UserSerializer
from .permissions import IsSuperAdmin

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Voucher is automatically created with a code from voucher_barcode_with_serial.xlsx
        login(request, user)
        return Response({
            "message": "Pengguna berjaya dicipta",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

register_view = csrf_exempt(register_view)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {"error": "Nama pengguna dan kata laluan diperlukan"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            "message": "Log masuk berjaya",
            "user": UserSerializer(user).data
        })
    else:
        return Response(
            {"error": "Kelayakan tidak sah"},
            status=status.HTTP_401_UNAUTHORIZED
        )

login_view = csrf_exempt(login_view)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Log keluar berjaya"})

logout_view = csrf_exempt(logout_view)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response(UserSerializer(request.user).data)


class VoucherViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            voucher = Voucher.objects.get(user=request.user)
        except Voucher.DoesNotExist:
            # Create voucher if it doesn't exist (fallback)
            voucher = Voucher.objects.create(user=request.user)
        
        return Response({
            "code": voucher.code,
            "discount": voucher.discount_percent,
            "is_used": voucher.is_used
        })

    @action(detail=False, methods=['post'])
    def use_voucher(self, request):
        try:
            voucher = Voucher.objects.get(user=request.user)
        except Voucher.DoesNotExist:
            voucher = Voucher.objects.create(user=request.user)
            
        if voucher.is_used:
            return Response({"error": "Sudah dituntut"}, status=400)
        
        voucher.is_used = True
        voucher.save()
        return Response({"message": "Voucher berjaya digunakan!"})
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsSuperAdmin])
    def upload_batch(self, request):
        """
        Upload Excel file to replace voucher_barcode_with_serial.xlsx
        Only accessible by super admin users.
        """
        if 'file' not in request.FILES:
            return Response(
                {"error": "Fail Excel diperlukan"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        excel_file = request.FILES['file']
        
        # Validate file extension
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {"error": "Fail mesti dalam format Excel (.xlsx atau .xls)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Read and validate Excel file structure
            df = pd.read_excel(excel_file)
            
            # Check for 'barcode' column (case-insensitive)
            barcode_column = None
            for col in df.columns:
                if col.lower() == 'barcode':
                    barcode_column = col
                    break
            
            if barcode_column is None:
                return Response(
                    {"error": "Fail Excel mesti mengandungi lajur 'barcode'"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate that there are barcode values
            barcode_values = df[barcode_column].dropna().tolist()
            if len(barcode_values) == 0:
                return Response(
                    {"error": "Fail Excel mesti mengandungi sekurang-kurangnya satu kod barcode"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save file to replace voucher_barcode_with_serial.xlsx
            excel_file_path = settings.BASE_DIR / 'voucher_barcode_with_serial.xlsx'
            
            # Reset file pointer to beginning
            excel_file.seek(0)
            
            # Save the uploaded file
            with open(excel_file_path, 'wb') as destination:
                for chunk in excel_file.chunks():
                    destination.write(chunk)
            
            return Response({
                "message": f"Fail Excel berjaya dimuat naik. {len(barcode_values)} kod barcode tersedia.",
                "total_codes": len(barcode_values)
            }, status=status.HTTP_200_OK)
            
        except pd.errors.EmptyDataError:
            return Response(
                {"error": "Fail Excel kosong atau tidak sah"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Ralat memproses fail Excel: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
