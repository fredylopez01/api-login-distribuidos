/**
 * Middleware de Autenticación
 * Valida tokens JWT y maneja autorización
 * Responsable: Naranjo
 */

// TODO: Implementar middleware de autenticación
// - verifyToken(req, res, next)
// - checkRole(roles)(req, res, next)
// - rateLimiter(req, res, next)

// src/middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // El token se espera en formato: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      message: "Token de acceso requerido" 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        message: "Token inválido o expirado" 
      });
    }
    req.user = user; // Guardamos el usuario en la request para usarlo en controladores
    next();
  });
}

// Middleware para verificar roles de usuario
function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para acceder a este recurso"
      });
    }

    next();
  };
}

module.exports = { verifyToken, checkRole };
