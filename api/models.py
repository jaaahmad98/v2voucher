from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Voucher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=50, default="WELCOME15")
    discount_percent = models.IntegerField(default=15)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.code}"

# This "Signal" automatically creates a voucher when a new user registers
@receiver(post_save, sender=User)
def create_welcome_voucher(sender, instance, created, **kwargs):
    if created:
        Voucher.objects.create(user=instance)
