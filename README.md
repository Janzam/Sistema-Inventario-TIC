# 💻 Sistema de Inventario TIC - Janzam

Sistema profesional de gestión de inventario para equipos tecnológicos, desarrollado con **Django** (Backend), **React** (Frontend) y **PostgreSQL**.

---

## 🛠️ Guía de Instalación desde Cero

### 1. Requisitos Previos
* Python 3.10+ instalado.
* Node.js y npm instalados (para el Frontend).
* PostgreSQL y pgAdmin 4 instalados.

### 2. Configuración de la Base de Datos (pgAdmin 4)
Antes de correr el proyecto, debes crear la base de datos manualmente:
1. Abre **pgAdmin 4**.
2. Haz clic derecho en **Servers** > **PostgreSQL** > **Databases**.
3. Selecciona **Create** > **Database...**.
4. En "Database", escribe el nombre (por ejemplo: `postgres` o `inventario_db`).
5. Asegúrate de conocer tu usuario (por defecto es `postgres`) y tu contraseña de instalación.
6. Haz clic en **Save**.



---

### 3. Configuración del Backend (Django)

1. **Entrar a la carpeta y crear entorno virtual:**
   ```bash
   cd backend
   python -m venv venv
   # Activar en Windows:
   .\venv\Scripts\activate

2. **Instalar librerías:**
   ```bash
   pip install -r requirements.txt

3. **Configurar Variables de Entorno (.env):**
   Crea un archivo `.env` en la raíz de la carpeta `backend/` con los datos que configuraste en pgAdmin:
    ```bash
    DEBUG=True
    SECRET_KEY=tu_clave_secreta_aqui
    DB_NAME=nombre_de_tu_bd_en_pgadmin
    DB_USER=postgres
    DB_PASS=tu_contraseña_de_pgadmin
    DB_HOST=127.0.0.1
    DB_PORT=5432
    ALLOWED_HOSTS=localhost,127.0.0.1
4. **Migrar y Correr:**
   ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
### 4. Configuración del Frontend (React)

1. **Entrar a la carpeta e instalar:**
   ```bash
   cd ../frontend
   npm install

2. **Correr el proyecto:**
   ```bash
   npm run dev


## Desarrollado con ❤️ por Janzam.






   
