from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, Voucher
from .utils import get_available_voucher_code

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    phone_number = serializers.CharField(write_only=True, required=True, max_length=20)
    state = serializers.CharField(write_only=True, required=True, max_length=100)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'email', 'phone_number', 'state')
        extra_kwargs = {
            'email': {'required': True}  # Now required
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Check if voucher code is available BEFORE creating user
        try:
            voucher_code = get_available_voucher_code()
        except ValueError as e:
            # Raise validation error if no codes available
            raise serializers.ValidationError({"error": str(e)})
        except Exception as e:
            raise serializers.ValidationError({"error": f"Failed to get voucher code: {str(e)}"})
        
        phone_number = validated_data.pop('phone_number')
        state = validated_data.pop('state')
        email = validated_data.pop('email', '')
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=email
        )
        
        # Create voucher with the code from Excel
        Voucher.objects.create(user=user, code=voucher_code)
        
        # Update UserProfile with email, phone_number and state
        user_profile = user.userprofile
        user_profile.email = email
        user_profile.phone_number = phone_number
        user_profile.state = state
        user_profile.save()
        
        return user

class UserSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'state')

    def get_email(self, obj):
        try:
            return obj.userprofile.email
        except UserProfile.DoesNotExist:
            return None

    def get_phone_number(self, obj):
        try:
            return obj.userprofile.phone_number
        except UserProfile.DoesNotExist:
            return None

    def get_state(self, obj):
        try:
            return obj.userprofile.state
        except UserProfile.DoesNotExist:
            return None