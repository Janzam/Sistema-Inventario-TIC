from django.db import migrations
from django.contrib.auth.models import User

def create_default_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Persona = apps.get_model('inventario', 'Persona')
    
    # Solo crear si no hay ningún usuario
    if not User.objects.exists():
        user = User.objects.create_superuser(
            username='admin_tic',
            email='admin@inventario.com',
            password='admin_password_2026',
            first_name='ADMINISTRADOR MAESTRO'
        )
        
        # Crear perfil de Persona con rol ADMIN
        Persona.objects.create(
            user=user,
            nombre='ADMINISTRADOR MAESTRO',
            identificacion='MASTER_001',
            email='admin@inventario.com',
            rol='ADMIN'
        )

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0011_set_initial_admins'),
    ]

    operations = [
        migrations.RunPython(create_default_admin),
    ]
