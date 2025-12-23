from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile


class Command(BaseCommand):
    help = 'Set a user as super admin by username'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to set as super admin')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            user_profile.role = 'super_admin'
            user_profile.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully set user "{username}" as super admin')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User "{username}" does not exist')
            )

