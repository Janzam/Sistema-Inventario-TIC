import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from inventario.models import Categoria

# Mapeo de imágenes generadas
images = {
    "Hardware y Componentes Internos": "cat_hardware_internos_1774306392095.png",
    "Equipos de Comunicación y Telefonía": "cat_networking_telefonia_1774306532902.png",
    "Periféricos y Accesorios": "cat_perifericos_accesorios_1774306562683.png",
    "Cableado y Conectividad": "cat_cableado_v2_1774306631052.png"
}

def update_images():
    for name, img in images.items():
        try:
            cat = Categoria.objects.get(nombre=name)
            # Como están en el cerebro, no son accesibles directamente por la URL del servidor
            # Pero el frontend ya usa URLs de Unsplash para la estética premium.
            # Este script es solo por si quisiéramos persistir rutas locales.
            # Por ahora, mantendremos las de Unsplash en el Dashboard.jsx por estética.
            print(f"Imagen para {name} identificada.")
        except Categoria.DoesNotExist:
            pass

if __name__ == "__main__":
    update_images()
