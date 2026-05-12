from django.db import migrations
from django.contrib.auth.hashers import make_password

def reset_admin_password(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    try:
        user = User.objects.get(username='admin_tic')
        user.password = make_password('admin2026@')
        user.is_active = True
        user.save()
    except User.DoesNotExist:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0013_ensure_admin_account'),
    ]

    operations = [
        migrations.RunPython(reset_admin_password),
    ]
