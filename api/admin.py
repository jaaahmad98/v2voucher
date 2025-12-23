from django.contrib import admin
from .models import Voucher, UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'phone_number', 'state', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'email', 'phone_number', 'state')

# Register your models here.
admin.site.register(Voucher)
