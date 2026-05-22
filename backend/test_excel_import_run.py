import os
import django

# Setup django environment before importing any django components
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from inventario.views import EquipoViewSet

excel_path = r"C:\Users\DELL\Downloads\Inventario 2 (4) 2.xlsx"
print(f"Reading file from: {excel_path}")

try:
    with open(excel_path, 'rb') as f:
        file_content = f.read()
    print(f"File size: {len(file_content)} bytes")
    uploaded_file = SimpleUploadedFile("Inventario 2 (4) 2.xlsx", file_content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    factory = APIRequestFactory()
    # Constructing request
    request = factory.post('/api/equipos/import_excel/', {'file': uploaded_file}, format='multipart')

    # Get a user to assign to request
    user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    if not user:
        # Create a temp admin user
        user = User.objects.create_superuser('admin_temp', 'admin@example.com', 'admin123')
    
    # Force authenticate
    force_authenticate(request, user=user)
    print(f"Authenticated as user: {user.username}")

    print("Invoking import_excel view...")
    view = EquipoViewSet.as_view({'post': 'import_excel'})
    
    # We run within a transaction to avoid cluttering or we can run to commit and check
    response = view(request)
    print("\n--- VIEW RESPONSE ---")
    print("STATUS CODE:", response.status_code)
    
    if response.status_code == 200:
        data = response.data
        print("Message:", data.get("message"))
        print("Total Errors:", len(data.get("errors", [])))
        print("Total Warnings:", len(data.get("warnings", [])))
        if data.get("errors"):
            print("\nFirst 10 Errors:")
            for err in data["errors"][:10]:
                print("-", err)
        if data.get("warnings"):
            print("\nFirst 10 Warnings:")
            for wrn in data["warnings"][:10]:
                print("-", wrn)
    else:
        print("ERROR DATA:", response.data)

except Exception as e:
    import traceback
    traceback.print_exc()
