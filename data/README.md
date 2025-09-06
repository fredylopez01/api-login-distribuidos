# Archivos de Datos

Este directorio contiene los archivos planos para la persistencia de datos.

## Archivos:

- `users.json` - Almacena información de usuarios registrados
- `reset_tokens.json` - Almacena tokens de recuperación de contraseñas

## Estructura de datos:

### users.json
```json
[
  {
    "id": "uuid",
    "email": "usuario@email.com",
    "password": "hash_bcrypt",
    "role": "user|admin|moderator",
    "isActive": true,
    "loginAttempts": 0,
    "lastLogin": "2025-09-06T12:00:00Z",
    "createdAt": "2025-09-06T12:00:00Z"
  }
]
```

### reset_tokens.json
```json
[
  {
    "token": "random_token",
    "userId": "user_id",
    "expiresAt": "2025-09-06T13:00:00Z",
    "isUsed": false,
    "createdAt": "2025-09-06T12:00:00Z"
  }
]
```
