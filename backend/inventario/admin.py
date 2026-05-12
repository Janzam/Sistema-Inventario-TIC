from django.contrib import admin
from .models import Equipo, Profile, Categoria, Subcategoria, Persona

@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ('nombre_equipo', 'serie', 'estado', 'usuario_asignado', 'creado_por')
    search_fields = ('nombre_equipo', 'serie', 'usuario_asignado')
    list_filter = ('estado', 'marca')

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'color')

@admin.register(Subcategoria)
class SubcategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria')

@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'identificacion', 'email', 'user')
    search_fields = ('nombre', 'identificacion')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'picture_exists')

    def picture_exists(self, obj):
        return bool(obj.picture)
    picture_exists.boolean = True
