from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import Voucher
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserRegistrationSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Voucher is automatically created by the signal
        login(request, user)
        return Response({
            "message": "User created successfully",
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
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            "message": "Login successful",
            "user": UserSerializer(user).data
        })
    else:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

login_view = csrf_exempt(login_view)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logout successful"})

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
            return Response({"error": "Already claimed"}, status=400)
        
        voucher.is_used = True
        voucher.save()
        return Response({"message": "Voucher used successfully!"})
