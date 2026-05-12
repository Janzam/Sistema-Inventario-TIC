from django.db import models
from django.conf import settings

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    imagen = models.TextField(blank=True, null=True) # Base64 or URL
    color = models.CharField(max_length=20, default='#6366f1') # Indigo default
    
    def __str__(self):
        return self.nombre

class Subcategoria(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='subcategorias')
    nombre = models.CharField(max_length=100)

    class Meta:
        unique_together = ('categoria', 'nombre')

    def __str__(self):
        return f"{self.categoria.nombre} > {self.nombre}"

class Equipo(models.Model):
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mis_equipos',
        null=True, 
        blank=True
    )

    subcategoria = models.ForeignKey(
        Subcategoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipos'
    )

    ESTADOS = [
        ('DISPONIBLE', 'Disponible'),
        ('ASIGNADO', 'Asignado'),
        ('REPARACION', 'En Reparación'),
        ('BAJA', 'Baja'),
        ('NUEVO', 'Nuevo'),
    ]

    nombre_equipo = models.CharField(max_length=100)
    serie = models.CharField(max_length=100, unique=True)
    marca = models.CharField(max_length=100, blank=True, null=True)
    modelo = models.CharField(max_length=100, blank=True, null=True)
    activo_fijo = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    estado = models.CharField(max_length=20, choices=ESTADOS, default='NUEVO')
    usuario_asignado = models.ForeignKey('Persona', on_delete=models.SET_NULL, null=True, blank=True, related_name='equipos_asignados')
    departamento = models.CharField(max_length=100, blank=True, null=True)
    
    novedad = models.TextField(blank=True, null=True)
    fecha_ingreso = models.DateField(null=True, blank=True)
    fecha_baja = models.DateField(null=True, blank=True)
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre_equipo', 'serie']

    def save(self, *args, **kwargs):
        if self.nombre_equipo:
            self.nombre_equipo = self.nombre_equipo.upper().strip()
        if self.serie:
            self.serie = self.serie.upper().strip()
        if self.marca:
            self.marca = self.marca.upper().strip()
        if self.modelo:
            self.modelo = self.modelo.upper().strip()
        if self.departamento:
            self.departamento = self.departamento.upper().strip()
        if self.activo_fijo:
            self.activo_fijo = self.activo_fijo.upper().strip()
            if self.activo_fijo == "SIN ACTIVO FIJO":
                self.activo_fijo = None

        user = self.usuario_asignado
        status = getattr(self, 'estado', 'NUEVO')

        if not user:
            if status not in ['NUEVO', 'BAJA', 'REPARACION']:
                self.estado = 'DISPONIBLE'
        elif status in ['DISPONIBLE', 'NUEVO']:
            self.estado = 'ASIGNADO'

        super(Equipo, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre_equipo} ({self.serie})"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    picture = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

class Persona(models.Model):
    nombre = models.CharField(max_length=150)
    identificacion = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    
    # Vinculación con el usuario del sistema
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='persona'
    )

    ROLES = [
        ('ADMIN', 'Administrador'),
        ('TECNICO', 'Técnico'),
        ('VIEWER', 'Visualizador'),
    ]
    rol = models.CharField(max_length=10, choices=ROLES, default='VIEWER')

    fecha_registro = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.nombre:
            self.nombre = self.nombre.upper().strip()
        if self.identificacion:
            self.identificacion = self.identificacion.strip()
        super(Persona, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.identificacion})"