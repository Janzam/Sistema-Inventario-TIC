from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0009_remove_equipo_fecha_registro'),
    ]

    operations = [
        migrations.AddField(
            model_name='persona',
            name='rol',
            field=models.CharField(choices=[('ADMIN', 'Administrador'), ('TECNICO', 'Técnico'), ('VIEWER', 'Visualizador')], default='VIEWER', max_length=10),
        ),
    ]
