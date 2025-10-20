1. Instalar dependencias:
```bash
npm install
```

2. MongoDB corriendo en `localhost:27017`

3. Iniciar el servidor:
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## Endpoints

### Autenticación

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Sites (requieren autenticación)

- `GET /sites` - Obtener todos los sites
- `GET /sites/:id` - Obtener site por ID
- `POST /create-sites` - Crear nuevo site
- `PATCH /update-sites/:id` - Actualizar site
- `DELETE /delete-sites/:id` - Eliminar site

## Uso

### 1. Registrar usuario
```bash
curl -X POST http://localhost:1111/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:1111/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Crear site (con token)
```bash
curl -X POST http://localhost:1111/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mi Sitio Web",
    "description": "Descripción del sitio",
    "siteUrl": "https://misitioweb.com",
    "socialnetwork": "https://twitter.com/misitioweb"
  }'
```

### 4. Obtener sites
```bash
curl -X GET http://localhost:1111/sites \
  -H "Authorization: YOUR_JWT_TOKEN"
```

## Base de datos

- **MongoDB**: `mongodb://localhost:27017/sites-db`
- **Puerto**: 1111
- **Colecciones**: `sites`, `users`

## Estructura del proyecto

```
proyecto-final/
├── package.json
├── server.js
└── README.md
```
