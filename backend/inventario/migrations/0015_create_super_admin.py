from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_super_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Persona = apps.get_model('inventario', 'Persona')
    
    # Crear super_admin / admin2026
    user, created = User.objects.get_or_create(
        username='super_admin',
        defaults={
            'email': 'superadmin@inventario.com',
            'first_name': 'SUPER ADMINISTRADOR',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'password': make_password('admin2026')
        }
    )
    
    if not created:
        user.password = make_password('admin2026')
        user.is_active = True
        user.save()
        
    # Asegurar Perfil
    Persona.objects.get_or_create(
        user=user,
        defaults={
            'nombre': 'SUPER ADMINISTRADOR',
            'identificacion': 'SUPER_001',
            'email': 'superadmin@inventario.com',
            'rol': 'ADMIN'
        }
    )

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0014_reset_admin_password'),
    ]

    operations = [
        migrations.RunPython(create_super_admin),
    ]
