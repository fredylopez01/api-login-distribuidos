const { sanitizeInput } = require("../utils/validators");
const { loginUser } = require("../services/authService");
const { logUserAction, logError } = require("../middleware/logger");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const result = await loginUser(sanitizedEmail, password);

    if (result.error) {
      await logUserAction(
        "LOGIN_FAILED",
        null,
        `Intento fallido con email: ${sanitizedEmail}`
      );
      return res.status(401).json({ message: result.error });
    }

    await logUserAction(
      "LOGIN_SUCCESS",
      sanitizedEmail,
      "Usuario inició sesión"
    );
    return res.json({ message: "Login exitoso", token: result.token });
  } catch (error) {
    await logError("LOGIN-ERROR", null, `Error en el login: ${error.message}`);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = {
  login,
};
