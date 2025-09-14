const jwt = require("jsonwebtoken");
const { userRoles } = require("../models/User");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token de acceso requerido",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Token inválido o expirado",
      });
    }
    req.user = user;
    next();
  });
}

function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const invalidRoles = allowedRoles.filter(
      (role) => !Object.values(userRoles).includes(role)
    );
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        message: "Rol inválido",
        data: {
          validRoles: Object.values(userRoles),
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para acceder a este recurso",
      });
    }

    next();
  };
}

module.exports = { verifyToken, checkRole };
