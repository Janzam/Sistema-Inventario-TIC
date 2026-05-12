from django.db import migrations

def ensure_admin_exists(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Persona = apps.get_model('inventario', 'Persona')
    
    # Asegurar que el usuario admin_tic exista
    user, created = User.objects.get_or_create(
        username='admin_tic',
        defaults={
            'email': 'admin@inventario.com',
            'first_name': 'ADMINISTRADOR MAESTRO',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    
    # Forzar actualización de contraseña y estado activo
    from django.contrib.auth.hashers import make_password
    user.password = make_password('admin2026@')
    user.is_active = True
    user.save()
        
    # Asegurar que tenga su perfil de Persona
    Persona.objects.get_or_create(
        user=user,
        defaults={
            'nombre': 'ADMINISTRADOR MAESTRO',
            'identificacion': 'MASTER_001',
            'email': 'admin@inventario.com',
            'rol': 'ADMIN'
        }
    )

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0012_create_default_admin'),
    ]

    operations = [
        migrations.RunPython(ensure_admin_exists),
    ]
