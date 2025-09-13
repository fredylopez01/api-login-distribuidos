const { User } = require("../models/User");
const {
  readResetTokens,
  writeResetTokens,
  writeErrorLog,
} = require("../services/fileService");
const { sendPasswordResetEmail } = require("../services/emailService");
const { sanitizeInput } = require("../utils/validators");
const { logUserAction } = require("../middleware/logger");
const { generateTemporaryPassword } = require("../utils/passwords");

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const user = await User.findByEmail(sanitizedEmail);
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({
        message:
          "Si el email existe en nuestro sistema, recibirás un correo con las instrucciones",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: "Esta cuenta está bloqueada. Contacta al administrador",
      });
    }

    await logUserAction(
      "PASSWORD_RESET_REQUEST",
      user?.id || sanitizedEmail,
      "Solicitud de recuperación de contraseña"
    );

    const resetToken = generateTemporaryPassword();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token de reseteo
    const resetTokens = await readResetTokens();

    // Eliminar tokens previos para este email
    const filteredTokens = resetTokens.filter(
      (token) => token.email !== sanitizedEmail
    );

    filteredTokens.push({
      email: sanitizedEmail,
      token: resetToken,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    });

    await writeResetTokens(filteredTokens);

    // Enviar correo con contraseña temporal
    const emailSent = await sendPasswordResetEmail(sanitizedEmail, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        message: "Error al enviar el correo de recuperación",
      });
    }

    res.status(200).json({
      message:
        "Si el email existe en nuestro sistema, recibirás un correo con una contraseña temporal",
    });
  } catch (error) {
    await writeErrorLog({
      message: `REQUEST-RESET-PASSWORD-ERROR: Error petición de reseteo de contraseña: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Buscar y validar token
    const resetTokens = await readResetTokens();
    const tokenRecord = resetTokens.find(
      (t) => t.token === token && t.email === sanitizedEmail && !t.used
    );

    if (!tokenRecord) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    // Verificar expiración
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return res.status(400).json({
        message: "Token expirado",
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByEmail(sanitizedEmail);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Actualizar contraseña
    await User.update(user.id, { password: newPassword });

    // Marcar token como usado
    const updatedTokens = resetTokens.map((t) =>
      t.token === token
        ? { ...t, used: true, usedAt: new Date().toISOString() }
        : t
    );
    await writeResetTokens(updatedTokens);
    await logUserAction(
      "PASSWORD_RESET",
      user.id,
      "Contraseña restablecida con token"
    );

    res.status(200).json({
      message: "Contraseña restablecida exitosamente",
    });
  } catch (error) {
    await writeErrorLog({
      message: `RESET-PASSWORD-ERROR: Error restableciendo contraseña: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const isValid = await User.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        message: "Contraseña actual incorrecta",
      });
    }

    // Actualizar contraseña
    await User.update(userId, { password: newPassword });
    await logUserAction(
      "PASSWORD_CHANGE",
      userId,
      "Usuario cambió su contraseña"
    );

    res.status(200).json({
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    await writeErrorLog({
      message: `CHANGE-PASSWORD-ERROR: Error en cambio de contraseña: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token, email } = req.body;
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Buscar token
    const resetTokens = await readResetTokens();
    const tokenRecord = resetTokens.find(
      (t) => t.token === token && t.email === sanitizedEmail && !t.used
    );

    if (!tokenRecord) {
      return res.status(400).json({
        message: "Token inválido",
        data: { valid: false },
      });
    }

    // Verificar expiración
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return res.status(400).json({
        message: "Token expirado",
        data: { valid: false },
      });
    }

    res.status(200).json({
      message: "Token válido",
      data: {
        valid: true,
        expiresAt: tokenRecord.expiresAt,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `VALIDATE-TOKEN-ERROR: Error en validación de token: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
  changePassword,
  validateResetToken,
};
