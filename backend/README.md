# SmartHome Manager API

Backend API para SmartHome Manager construido con FastAPI.

## 🚀 Características

- **Gestión de Propiedades**: Operaciones CRUD completas
- **Alquileres y Contratos**: Gestión de contratos y pagos
- **Seguimiento de Gastos**: Categorización y análisis de gastos
- **Valoración IA**: Estimación de valor de propiedades con ML
- **Asistente IA**: Interfaz conversacional para consultas
- **Autenticación JWT**: Seguridad con tokens JWT
- **Paginación**: Todos los endpoints de listado soportan paginación
- **Rate Limiting**: Limitación de peticiones por IP
- **Versionado de API**: API versionada (v1)

## 📁 Estructura del Proyecto

\`\`\`
backend/
├── app/
│   ├── main.py                 # Aplicación principal FastAPI
│   ├── api/
│   │   ├── routes_propiedades.py   # Endpoints de propiedades, auth, alquileres, gastos
│   │   ├── routes_chat.py          # Endpoints de chat IA
│   │   └── routes_predict_valor.py # Endpoints de predicción de valor
│   ├── core/
│   │   ├── config.py           # Configuración de la aplicación
│   │   ├── database.py         # Configuración de base de datos
│   │   └── security.py         # Autenticación y seguridad JWT
│   ├── models/
│   │   ├── propiedad.py        # Modelos de Propiedad, Alquiler, Pago, Gasto
│   │   └── usuario.py          # Modelo de Usuario
│   ├── schemas/
│   │   ├── propiedad_schema.py # Schemas Pydantic de propiedades
│   │   └── usuario_schema.py   # Schemas Pydantic de usuarios
│   ├── ml/
│   │   └── predictor.py        # Predictor de valor de propiedades
│   └── utils/
│       └── chat_engine.py      # Motor de chat IA
└── requirements.txt
\`\`\`

## 🛠️ Instalación

1. **Instalar dependencias:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. **Configurar variables de entorno (opcional):**
\`\`\`bash
cp .env.example .env
# Editar .env con tus configuraciones
\`\`\`

3. **Ejecutar el servidor:**
\`\`\`bash
# Desde la carpeta backend/
uvicorn app.main:app --reload
\`\`\`

La API estará disponible en `http://localhost:8000`

## 📚 Documentación de la API

Una vez el servidor esté corriendo, visita:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

### Registro de Usuario
\`\`\`bash
POST /api/v1/propiedades/auth/register
{
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Pérez",
  "password": "contraseña123"
}
\`\`\`

### Login
\`\`\`bash
POST /api/v1/propiedades/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
\`\`\`

Respuesta:
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
\`\`\`

### Usar el Token
Incluye el token en el header de tus peticiones:
\`\`\`
Authorization: Bearer {tu_token_aqui}
\`\`\`

## 📋 Endpoints Principales

### Autenticación
- `POST /api/v1/propiedades/auth/register` - Registrar usuario
- `POST /api/v1/propiedades/auth/login` - Iniciar sesión
- `GET /api/v1/propiedades/auth/me` - Obtener usuario actual

### Propiedades
- `GET /api/v1/propiedades?skip=0&limit=10` - Listar propiedades (paginado)
- `POST /api/v1/propiedades` - Crear propiedad
- `GET /api/v1/propiedades/{id}` - Obtener propiedad
- `PUT /api/v1/propiedades/{id}` - Actualizar propiedad
- `DELETE /api/v1/propiedades/{id}` - Eliminar propiedad

### Alquileres
- `GET /api/v1/propiedades/alquileres?skip=0&limit=10` - Listar alquileres
- `POST /api/v1/propiedades/alquileres` - Crear alquiler

### Gastos
- `GET /api/v1/propiedades/gastos?skip=0&limit=10` - Listar gastos
- `POST /api/v1/propiedades/gastos` - Crear gasto

### Predicción de Valor IA
- `POST /api/v1/predict-valor` - Predecir valor de propiedad

### Chat IA
- `POST /api/v1/chat` - Chat con asistente
- `GET /api/v1/chat/insights` - Obtener insights del portfolio

## 📊 Paginación

Todos los endpoints de listado soportan paginación:

\`\`\`bash
GET /api/v1/propiedades?skip=0&limit=10
\`\`\`

Respuesta:
\`\`\`json
{
  "success": true,
  "data": [...],
  "total": 45,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}
\`\`\`

## 🔒 Rate Limiting

La API implementa rate limiting por IP:
- Endpoints generales: 60 peticiones/minuto
- Registro: 5 peticiones/minuto
- Login: 10 peticiones/minuto
- Predicción de valor: 10 peticiones/minuto
- Chat: 20 peticiones/minuto

## 📝 Códigos de Estado HTTP

La API utiliza códigos HTTP estándar:

- **200 OK**: Petición exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en la petición (datos inválidos)
- **401 Unauthorized**: No autenticado o token inválido
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## 🗄️ Base de Datos

La aplicación usa SQLite por defecto. El archivo `smarthome.db` se crea automáticamente en el primer arranque.

### Modelos Principales:
- **Usuario**: Gestión de usuarios y autenticación
- **Propiedad**: Información de propiedades
- **Alquiler**: Contratos de alquiler
- **Pago**: Pagos de alquileres
- **Gasto**: Gastos de propiedades

## 🔧 Configuración

Edita el archivo `.env` para personalizar:

\`\`\`env
# Seguridad
SECRET_KEY=tu-clave-secreta-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Base de datos
DATABASE_URL=sqlite:///./smarthome.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
\`\`\`

## 🚀 Producción

Para producción, considera:

1. **Usar PostgreSQL** en lugar de SQLite
2. **Configurar SECRET_KEY** segura (usar `openssl rand -hex 32`)
3. **Configurar CORS** con dominios específicos
4. **Habilitar HTTPS**
5. **Configurar logging** apropiado
6. **Usar variables de entorno** para configuración sensible
7. **Implementar monitoreo** y alertas

## 📖 Ejemplos de Uso

### Crear una Propiedad
\`\`\`bash
curl -X POST "http://localhost:8000/api/v1/propiedades" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Apartamento Moderno",
    "direccion": "Calle Principal 123",
    "tipo": "apartamento",
    "precio": 150000,
    "area": 85.5,
    "habitaciones": 2,
    "banos": 2,
    "descripcion": "Hermoso apartamento en zona céntrica"
  }'
\`\`\`

### Predecir Valor de Propiedad
\`\`\`bash
curl -X POST "http://localhost:8000/api/v1/predict-valor" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Av. Libertador 456",
    "tipo": "casa",
    "area": 120,
    "habitaciones": 3,
    "banos": 2,
    "ubicacion_score": 8
  }'
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
