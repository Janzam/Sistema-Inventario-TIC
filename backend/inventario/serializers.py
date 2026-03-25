from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Equipo, Profile, Categoria, Subcategoria

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['picture']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class SubcategoriaSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    class Meta:
        model = Subcategoria
        fields = ['id', 'nombre', 'categoria', 'categoria_nombre']

class EquipoSerializer(serializers.ModelSerializer):
    creado_por = serializers.ReadOnlyField(source='creado_por.username')
    subcategoria_detalle = SubcategoriaSerializer(source='subcategoria', read_only=True)
    
    class Meta:
        model = Equipo
        fields = [
            'id', 'creado_por', 'subcategoria', 'subcategoria_detalle',
            'nombre_equipo', 'serie', 'marca', 'modelo', 'activo_fijo',
            'estado', 'usuario_asignado', 'departamento', 'novedad',
            'fecha_ingreso', 'fecha_baja', 'ultima_actualizacion'
        ]

    def validate_serie(self, value):
        serie_nueva = value.upper().strip()
        instance = getattr(self, 'instance', None)
        qs = Equipo.objects.filter(serie__iexact=serie_nueva)
        
        if instance:
            qs = qs.exclude(pk=instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError("Error: Esta Serie ya pertenece a otro equipo registrado.")
            
        return serie_nueva