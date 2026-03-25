import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from inventario.models import Categoria, Subcategoria

# Datos de categorías y subcategorías
data = [
    {
        "nombre": "Hardware y Componentes Internos",
        "color": "#3b82f6", # Blue
        "subcategorias": [
            "Unidades de Procesamiento (CPUs/GPUs)",
            "Almacenamiento (HDD/SSD/Externos)",
            "Energía (PSU/Adaptadores/Baterías)",
            "Placas y Memoria (RAM/Motherboards/NIC)",
            "Carcasas y Gabinetes"
        ]
    },
    {
        "nombre": "Equipos de Comunicación y Telefonía",
        "color": "#10b981", # Emerald
        "subcategorias": [
            "Networking (Routers/Switches/APs/Firewalls)",
            "Telefonía (IP/Analógicos/PBX)"
        ]
    },
    {
        "nombre": "Periféricos y Accesorios",
        "color": "#f59e0b", # Amber
        "subcategorias": [
            "Entrada/Salida (Teclados/Mouses/Monitores)",
            "Imagen (Proyectores/Scanners/Printers)"
        ]
    },
    {
        "nombre": "Cableado y Conectividad",
        "color": "#8b5cf6", # Violet
        "subcategorias": [
            "Red (UTP/Fibra/Patch Cords)",
            "Video (HDMI/DP/VGA/DVI)",
            "Datos y Poder (USB/C13/Serial)"
        ]
    },
    {
        "nombre": "Insumos de Limpieza y Mantenimiento",
        "color": "#ec4899", # Pink
        "subcategorias": [
            "Limpieza de Superficies",
            "Limpieza Interna (Aire/Contact Cleaner)",
            "Gestión Térmica (Pasta/Pads)"
        ]
    },
    {
        "nombre": "Lubricantes y Químicos Especializados",
        "color": "#06b6d4", # Cyan
        "subcategorias": [
            "Aceites de Precisión",
            "Grasas (Litio/Grafito)",
            "Aflojatodo y Limpiadores de Rodillos"
        ]
    },
    {
        "nombre": "Herramientas y Misceláneos",
        "color": "#6366f1", # Indigo
        "subcategorias": [
            "Herramientas (Screwdrivers/Multimeters/Testers)",
            "Consumibles de Oficina (Tóner/Tinta/Papel)"
        ]
    }
]

def populate():
    for cat_data in data:
        cat, created = Categoria.objects.get_or_create(
            nombre=cat_data["nombre"],
            defaults={"color": cat_data["color"]}
        )
        if created:
            print(f"Creada categoría: {cat.nombre}")
        
        for sub_name in cat_data["subcategorias"]:
            sub, sub_created = Subcategoria.objects.get_or_create(
                categoria=cat,
                nombre=sub_name
            )
            if sub_created:
                print(f"  - Creada subcategoría: {sub.nombre}")

if __name__ == "__main__":
    populate()
    print("Población completada.")
