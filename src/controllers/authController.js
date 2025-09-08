/**
 * Controlador de Autenticación
 * Maneja las operaciones de login, logout y validación de tokens
 * Responsable: Naranjo
 */

// TODO: Implementar funciones de autenticación

const { sanitizeInput } = require("../utils/validators");
const { loginUser } = require("../services/authService");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const result = await loginUser(sanitizedEmail, password);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    return res.json({ message: "Login exitoso", token: result.token });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// - logout(req, res)
// - refreshToken(req, res)
// - validateToken(req, res)

module.exports = {
  login,
  // Funciones de autenticación
};
