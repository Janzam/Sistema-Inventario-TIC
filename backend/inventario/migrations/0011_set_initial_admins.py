from django.db import migrations

def set_initial_admins(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Persona = apps.get_model('inventario', 'Persona')
    
    for user in User.objects.all():
        # Asegurarnos de que el usuario esté activo
        user.is_active = True
        user.save()
        
        # Obtener o crear persona para este usuario
        persona, created = Persona.objects.get_or_create(
            user=user,
            defaults={
                'nombre': user.first_name or user.username,
                'identificacion': f"ADM_{user.id}",
                'email': user.email,
                'rol': 'ADMIN'
            }
        )
        if not created:
            persona.rol = 'ADMIN'
            persona.save()

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0010_persona_rol'),
    ]

    operations = [
        migrations.RunPython(set_initial_admins),
    ]
