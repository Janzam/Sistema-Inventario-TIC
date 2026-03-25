import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from inventario.models import Equipo
from django.contrib.auth.models import User

print("--- DIAGNÓSTICO DE EQUIPOS ---")
total = Equipo.objects.count()
print(f"Total de equipos en DB: {total}")

sin_autor = Equipo.objects.filter(creado_por__isnull=True).count()
print(f"Equipos sin autor (creado_por=NULL): {sin_autor}")

if total > 0:
    print("\nDetalle de equipos y categorías:")
    for eq in Equipo.objects.all():
        print(f"- Equipo: {eq.nombre_equipo} | Cat: {eq.subcategoria.categoria.nombre if eq.subcategoria else 'N/A'}")

print("\n--- FIN ---")
