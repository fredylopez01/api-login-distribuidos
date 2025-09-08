const { User } = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");

async function loginUser(email, password) {
  const user = await User.findByEmail(email);
  if (!user) return { error: "Credenciales inválidas" };

  if (!user.isActive) {
    return { error: "Cuenta inactiva" };
  }

  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    const localDate = new Date(user.lockUntil).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
    });
    return { error: `Cuenta bloqueada hasta ${localDate}` };
  }

  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    await User.incrementLoginAttempts(email);

    if (user.loginAttempts >= 5) {
      await User.updateLockUntil(email);
      return {
        error: "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.",
      };
    }
    return { error: "Credenciales inválidas" };
  }

  await User.resetLoginAttempts(email);
  const token = generateToken(user);

  return { token };
}

module.exports = { loginUser };
