# API de Login con Autenticación por Token

Este proyecto es un **sistema de login** implementado como una API REST.  
Incluye funcionalidades de:

- Creación de usuarios.
- Autenticación mediante **tokens JWT**.
- Manejo de **roles de usuario**.
- Recuperación de contraseñas por correo.
- Bloqueo de cuenta tras 5 intentos fallidos.
- Persistencia de datos en archivos planos.
- Registro de acciones (logs).
- Seguridad mediante encriptación de información sensible.

---

## 🚀 Objetivos del Proyecto

1. Implementar un sistema de login con autenticación por token.
2. Gestionar roles de usuario para restringir el acceso a ciertos recursos.
3. Desarrollar un sistema de recuperación de contraseñas mediante el envío de correos electrónicos.
4. Restringir el acceso después de más de 5 intentos fallidos.
5. Manejar persistencia de logs y usuarios en archivos planos.
6. Garantizar seguridad en la trazabilidad de la información mediante encriptación.

---

## 👥 Equipo

- **Fredy**: Configuración de repositorio, seguridad y documentación técnica.
- **David**: Registro de usuarios, roles y recuperación de contraseñas.
- **Naranjo**: Login con token, middleware y logs.

---

## 🔧 Tecnologías

- **Node.js / Express** (backend API)
- **JWT** (autenticación)
- **bcrypt** (encriptación de contraseñas)
- **Nodemailer** (envío de correos)
- **Archivos planos** (persistencia simple)

---

## 📂 Flujo de ramas

- `main` → rama estable (para presentación final).
- `develop` → rama de integración.
- `feature/nombre` → ramas de desarrollo individuales.

---

## 📜 Convenciones de commits

Usaremos el siguiente formato para mensajes de commit:

Ejemplos:

- `feat(auth): agregar login con JWT`
- `fix(register): corregir validación de email`
- `docs(api): actualizar documentación en README`

**Tipos válidos:**

- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `docs`: cambios en documentación
- `refactor`: reestructuración sin cambiar funcionalidad
- `test`: pruebas

---

## 📌 Reglas de colaboración

1. No hacer commits directos a `main` ni `develop`.
2. Todo cambio debe ir en una **feature branch**.
3. Los merges deben hacerse mediante **Pull Requests** con revisión de al menos un compañero.
4. Commits claros y en español/inglés consistente.

---

## 📑 Documentación de la API

La documentación estará disponible en **Postman/Swagger** (pendiente de implementar).
