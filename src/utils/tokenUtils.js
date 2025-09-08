/**
 * Utilidades de Token
 * Funciones para generar y validar tokens
 * Responsable: Naranjo
 */

const jwt = require("jsonwebtoken");

// TODO: Implementar funciones de token
// - generateJWT(payload)
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}
// - verifyJWT(token)
// - generateResetToken()
// - isTokenExpired(token)

module.exports = {
  generateToken,
};
