from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Equipo, Profile, Categoria, Subcategoria, Persona

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

class PersonaSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email_usuario = serializers.ReadOnlyField(source='user.email')
    has_user = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = ['id', 'nombre', 'identificacion', 'email', 'telefono', 'direccion', 'user', 'username', 'email_usuario', 'has_user', 'rol', 'fecha_registro']

    def get_has_user(self, obj):
        return obj.user is not None

    def validate_identificacion(self, value):
        identificacion = value.strip()
        instance = getattr(self, 'instance', None)
        
        # Verificar si ya existe otra persona con esta identificación
        qs = Persona.objects.filter(identificacion=identificacion)
        if instance:
            qs = qs.exclude(pk=instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError("Error: Esta identificación ya está registrada para otra persona.")
            
        return identificacion

class EquipoSerializer(serializers.ModelSerializer):
    creado_por = serializers.ReadOnlyField(source='creado_por.username')
    subcategoria_detalle = SubcategoriaSerializer(source='subcategoria', read_only=True)
    usuario_asignado_detalle = PersonaSerializer(source='usuario_asignado', read_only=True)
    
    class Meta:
        model = Equipo
        fields = [
            'id', 'creado_por', 'subcategoria', 'subcategoria_detalle',
            'nombre_equipo', 'serie', 'marca', 'modelo', 'activo_fijo',
            'estado', 'usuario_asignado', 'usuario_asignado_detalle', 
            'departamento', 'novedad', 'fecha_ingreso', 'fecha_asignacion', 'fecha_baja', 'ultima_actualizacion'
        ]

    def validate_serie(self, value):
        serie_nueva = value.upper().strip()
        instance = getattr(self, 'instance', None)
        qs = Equipo.objects.filter(serie__iexact=serie_nueva)
        
        if instance:
            qs = qs.exclude(pk=instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError("Error: Esta serie ya pertenece a otro equipo registrado.")
            
        return serie_nueva

    def validate_activo_fijo(self, value):
        if not value:
            return None
        af_nuevo = value.upper().strip()
        if af_nuevo == "SIN ACTIVO FIJO":
            return None
            
        instance = getattr(self, 'instance', None)
        qs = Equipo.objects.filter(activo_fijo__iexact=af_nuevo)
        
        if instance:
            qs = qs.exclude(pk=instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError("Error: Este código de activo fijo ya pertenece a otro equipo.")
            
        return af_nuevo