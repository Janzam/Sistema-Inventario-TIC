import pandas as pd
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import PieChart, BarChart, Reference
from .models import Equipo, Profile, Categoria, Subcategoria
from .serializers import (
    EquipoSerializer, UserSerializer, ProfileSerializer, 
    CategoriaSerializer, SubcategoriaSerializer
)

# --- VISTA PARA CATEGORÍAS ---
class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def with_stats(self, request):
        categorias = Categoria.objects.all()
        result = []
        for cat in categorias:
            subcats = cat.subcategorias.all()
            # Contar equipos por subcategoría que pertenezcan al usuario
            total_equipos = Equipo.objects.filter(
                subcategoria__categoria=cat,
                creado_por=request.user
            ).count()
            
            result.append({
                "id": cat.id,
                "nombre": cat.nombre,
                "imagen": cat.imagen,
                "color": cat.color,
                "total_equipos": total_equipos,
                "subcategorias": SubcategoriaSerializer(subcats, many=True).data
            })
        return Response(result)

class SubcategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
    permission_classes = [IsAuthenticated]

# --- VISTA PARA MANEJAR LOS EQUIPOS ---
class EquipoViewSet(viewsets.ModelViewSet):
    serializer_class = EquipoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # export_excel maneja su propia autenticación (token por query param para Brave)
        if self.action == 'export_excel':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Equipo.objects.filter(creado_por=self.request.user)
        subcat_id = self.request.query_params.get('subcategoria')
        cat_id = self.request.query_params.get('categoria')
        
        if subcat_id:
            queryset = queryset.filter(subcategoria_id=subcat_id)
        if cat_id:
            queryset = queryset.filter(subcategoria__categoria_id=cat_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)


    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        import io
        from datetime import date, datetime
        from rest_framework.authtoken.models import Token as AuthToken

        # Soporte para autenticación por query param (para window.open en Brave)
        auth_token_param = request.query_params.get('auth_token')
        if auth_token_param and not request.user.is_authenticated:
            try:
                token_obj = AuthToken.objects.get(key=auth_token_param)
                request.user = token_obj.user
            except AuthToken.DoesNotExist:
                return Response({"error": "Token inválido"}, status=401)

        if not request.user.is_authenticated:
            return Response({"error": "No autenticado"}, status=401)

        try:
            queryset = Equipo.objects.filter(creado_por=request.user)

            estado = request.query_params.get('estado')
            cat_id = request.query_params.get('categoria')

            if estado and estado != 'ALL':
                queryset = queryset.filter(estado=estado)

            if cat_id:
                queryset = queryset.filter(subcategoria__categoria_id=cat_id)

            print(f"DEBUG: Exportando {queryset.count()} equipos (Filtros: Estado={estado}, Cat={cat_id})")

            column_mapping = {
                'subcategoria__categoria__nombre': 'CATEGORÍA',
                'subcategoria__nombre': 'SUBCATEGORÍA',
                'nombre_equipo': 'NOMBRE DEL EQUIPO',
                'serie': 'NÚMERO DE SERIE',
                'marca': 'MARCA',
                'modelo': 'MODELO',
                'activo_fijo': 'ACTIVO FIJO ID',
                'estado': 'ESTADO ACTUAL',
                'usuario_asignado': 'RESPONSABLE / USUARIO',
                'departamento': 'DEPARTAMENTO',
                'fecha_ingreso': 'FECHA DE INGRESO',
            }

            if estado == 'BAJA':
                column_mapping['fecha_baja'] = 'FECHA DE BAJA'
                column_mapping['novedad'] = 'OBSERVACIONES / NOVEDAD DE BAJA'

            data = list(queryset.values(*column_mapping.keys()))

            # Normalizar valores: None → "", dates → string iso
            for row in data:
                for key, val in row.items():
                    if val is None:
                        row[key] = ''
                    elif isinstance(val, (date, datetime)):
                        row[key] = val.strftime('%Y-%m-%d')

            if data:
                df = pd.DataFrame(data)
                df = df[list(column_mapping.keys())]  # garantizar orden
                df = df.sort_values(by=['subcategoria__categoria__nombre', 'subcategoria__nombre', 'nombre_equipo'])
            else:
                df = pd.DataFrame(columns=list(column_mapping.keys()))

            df = df.rename(columns=column_mapping)
            # Reemplazar NaN residuales
            df = df.fillna('')

            output = io.BytesIO()

            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # ── Hoja 1: Inventario Detallado ─────────────────────────────
                df.to_excel(writer, index=False, sheet_name='Inventario Detallado')
                workbook = writer.book
                worksheet = writer.sheets['Inventario Detallado']

                header_fill = PatternFill(start_color="1E1E2D", end_color="1E1E2D", fill_type="solid")
                header_font = Font(color="FFFFFF", bold=True, size=11)
                cell_align  = Alignment(horizontal="center", vertical="center", wrap_text=True)
                thin_border = Border(
                    left=Side(style='thin', color='4B5563'),
                    right=Side(style='thin', color='4B5563'),
                    top=Side(style='thin', color='4B5563'),
                    bottom=Side(style='thin', color='4B5563'),
                )

                # Encabezados
                for col_num, col_name in enumerate(df.columns.values, start=1):
                    cell = worksheet.cell(row=1, column=col_num)
                    cell.fill = header_fill
                    cell.font = header_font
                    cell.alignment = cell_align
                    cell.border = thin_border
                    worksheet.column_dimensions[cell.column_letter].width = 26

                # Filas de datos
                for row in worksheet.iter_rows(min_row=2, max_row=len(df) + 1, min_col=1, max_col=len(df.columns)):
                    for cell in row:
                        cell.alignment = cell_align
                        cell.border = thin_border

                # ── Hoja 2: Métricas y Análisis ───────────────────────────────
                summary_sheet = workbook.create_sheet("Métricas y Análisis")
                title_font = Font(bold=True, size=12)
                hdr_font   = Font(bold=True, size=10)

                # ── Bloque: Resumen por Estado ──
                summary_sheet["A1"] = "RESUMEN POR ESTADO"
                summary_sheet["A1"].font = title_font
                summary_sheet["A2"] = "ESTADO"
                summary_sheet["B2"] = "CANTIDAD"
                summary_sheet["A2"].font = hdr_font
                summary_sheet["B2"].font = hdr_font

                if not df.empty and 'ESTADO ACTUAL' in df.columns:
                    status_counts = df['ESTADO ACTUAL'].replace('', 'Sin estado').value_counts()
                else:
                    status_counts = pd.Series(dtype=int)

                estado_start_row = 3
                for i, (sname, cnt) in enumerate(status_counts.items(), start=estado_start_row):
                    summary_sheet.cell(row=i, column=1, value=str(sname))
                    summary_sheet.cell(row=i, column=2, value=int(cnt))

                if not status_counts.empty:
                    pie = PieChart()
                    lbl_ref  = Reference(summary_sheet, min_col=1, min_row=estado_start_row,
                                         max_row=estado_start_row + len(status_counts) - 1)
                    data_ref = Reference(summary_sheet, min_col=2, min_row=2,
                                         max_row=estado_start_row + len(status_counts) - 1)
                    pie.add_data(data_ref, titles_from_data=True)
                    pie.set_categories(lbl_ref)
                    pie.title = "Distribución por Estado"
                    summary_sheet.add_chart(pie, "D2")

                # ── Bloque: Top 5 Marcas ──
                marca_block_row = estado_start_row + len(status_counts) + 3
                summary_sheet.cell(row=marca_block_row,     column=1, value="TOP 5 MARCAS").font = title_font
                summary_sheet.cell(row=marca_block_row + 1, column=1, value="MARCA").font  = hdr_font
                summary_sheet.cell(row=marca_block_row + 1, column=2, value="CANTIDAD").font = hdr_font

                if not df.empty and 'MARCA' in df.columns:
                    marca_counts = df['MARCA'].replace('', 'Sin marca').value_counts().head(5)
                else:
                    marca_counts = pd.Series(dtype=int)

                marca_data_start = marca_block_row + 2
                for i, (mname, cnt) in enumerate(marca_counts.items(), start=marca_data_start):
                    summary_sheet.cell(row=i, column=1, value=str(mname))
                    summary_sheet.cell(row=i, column=2, value=int(cnt))

                if not marca_counts.empty:
                    bar = BarChart()
                    bar.type  = "col"
                    bar.style = 10
                    bar.title = "Principales Marcas en Inventario"
                    bar.y_axis.title = "Unidades"
                    bar.x_axis.title = "Marca"
                    bar_lbl_ref  = Reference(summary_sheet, min_col=1, min_row=marca_data_start,
                                             max_row=marca_data_start + len(marca_counts) - 1)
                    bar_data_ref = Reference(summary_sheet, min_col=2, min_row=marca_block_row + 1,
                                             max_row=marca_data_start + len(marca_counts) - 1)
                    bar.add_data(bar_data_ref, titles_from_data=True)
                    bar.set_categories(bar_lbl_ref)
                    chart_anchor = f"D{marca_block_row}"
                    summary_sheet.add_chart(bar, chart_anchor)

                # ── Totales generales ──
                total_row = marca_data_start + len(marca_counts) + 3
                summary_sheet.cell(row=total_row, column=1, value="TOTAL DE EQUIPOS")
                summary_sheet.cell(row=total_row, column=1).font = Font(bold=True)
                summary_sheet.cell(row=total_row, column=2, value=len(df))

                summary_sheet.column_dimensions['A'].width = 28
                summary_sheet.column_dimensions['B'].width = 15

            output.seek(0)
            filename = f"Reporte_{estado if (estado and estado != 'ALL') else 'Global'}_Inventario_TIC.xlsx"
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

# --- VISTA PARA REGISTRO DE USUARIOS ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')

    if not username or not password:
        return Response({"error": "Usuario y contraseña requeridos"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Este usuario ya existe"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name
        )
        # Crear perfil automáticamente
        Profile.objects.get_or_create(user=user)
        
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {"username": user.username, "name": user.first_name, "email": user.email}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'GET'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        return Response({
            "username": user.username,
            "name": user.first_name,
            "email": user.email,
            "picture": profile.picture
        })

    if request.method == 'PUT':
        name = request.data.get('name')
        email = request.data.get('email')
        picture = request.data.get('picture')

        if name is not None:
            user.first_name = name
        if email is not None:
            user.email = email
        user.save()

        if picture is not None:
            profile.picture = picture
            profile.save()

        return Response({
            "message": "Perfil actualizado",
            "user": {"username": user.username, "name": user.first_name, "email": user.email, "picture": profile.picture}
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({"error": "Ambas contraseñas son requeridas"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "La contraseña actual es incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user.set_password(new_password)
        user.save()
        return Response({"message": "Contraseña actualizada correctamente"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)