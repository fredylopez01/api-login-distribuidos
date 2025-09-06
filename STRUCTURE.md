# Estructura del Proyecto - API Login

```
api-login-distribuidos/
├── src/
│   ├── controllers/           # Lógica de negocio
│   │   ├── authController.js      # Autenticación (Naranjo)
│   │   ├── userController.js      # Usuarios (David)
│   │   └── passwordController.js  # Recuperación (David)
│   │
│   ├── middleware/            # Middleware de la aplicación
│   │   ├── auth.js               # Autenticación JWT (Naranjo)
│   │   ├── validation.js         # Validaciones (David)
│   │   └── logger.js             # Logging (Naranjo)
│   │
│   ├── models/                # Modelos de datos
│   │   ├── User.js               # Modelo Usuario (David)
│   │   └── ResetToken.js         # Tokens recuperación (David)
│   │
│   ├── routes/                # Definición de rutas
│   │   ├── auth.js               # Rutas autenticación (Naranjo)
│   │   ├── users.js              # Rutas usuarios (David)
│   │   └── password.js           # Rutas recuperación (David)
│   │
│   ├── services/              # Servicios externos
│   │   ├── emailService.js       # Envío correos (David)
│   │   ├── encryptionService.js  # Encriptación (David)
│   │   └── fileService.js        # Persistencia archivos (Todos)
│   │
│   ├── utils/                 # Utilidades
│   │   ├── validators.js         # Validadores (David)
│   │   └── tokenUtils.js         # Utilidades JWT (Naranjo)
│   │
│   └── config/                # Configuraciones
│       ├── config.js             # Config general (Fredy)
│       └── database.js           # Config archivos (Fredy)
│
├── data/                      # Archivos de datos
│   ├── users.json                # Usuarios registrados
│   ├── reset_tokens.json         # Tokens de recuperación
│   └── README.md                 # Documentación de datos
│
├── logs/                      # Archivos de logs
│   └── README.md                 # Documentación de logs
│
├── docs/                      # Documentación
│   └── README.md                 # Documentación técnica
│
├── .env.example              # Variables de entorno ejemplo
├── .gitignore               # Archivos ignorados por git
├── index.js                 # Servidor principal
├── package.json             # Dependencias y scripts
└── README.md                # Documentación del proyecto
```
### 🔧 Dependencias Incluidas:

- `express` - Framework web
- `bcrypt` - Encriptación de contraseñas
- `jsonwebtoken` - Manejo de JWT
- `nodemailer` - Envío de correos
- `uuid` - Generación de IDs únicos
- `cors` - CORS middleware
- `helmet` - Seguridad HTTP
- `express-rate-limit` - Rate limiting
- `validator` - Validaciones
- `nodemon` - Desarrollo (dev dependency)
