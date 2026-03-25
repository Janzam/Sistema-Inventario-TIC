from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token 
from . import views 

router = DefaultRouter()
router.register(r'equipos', views.EquipoViewSet, basename='equipo')
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'subcategorias', views.SubcategoriaViewSet, basename='subcategoria')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', obtain_auth_token, name='api_token_auth'), 
    path('register/', views.register_user, name='register'),
    path('profile/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
]