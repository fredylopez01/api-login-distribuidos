const { User, userRoles } = require("../models/User");
const { sanitizeInput } = require("../utils/validators");
const { sendWelcomeEmail } = require("../services/emailService");
const { logUserAction } = require("../middleware/logger");
const { writeErrorLog } = require("../services/fileService");

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Sanitizar datos
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const userRole = role || userRoles.USER;

    // Crear usuario
    const newUser = await User.create({
      email: sanitizedEmail,
      password: password,
      role: userRole,
    });

    // Enviar correo de bienvenida (no bloquear si falla)
    sendWelcomeEmail(sanitizedEmail, "Usuario")
      .then(async () => {
        await logUserAction(
          "REGISTER-CONFIRMATION",
          newUser.id,
          "Correo de bienvenida enviado"
        );
      })
      .catch(async (error) => {
        await writeErrorLog({
          message: `REGISTER-CONFIRMATION-ERROR: Error al enviar correo de bienvenida: ${error.message}`,
          stack: error.stack,
        });
      });

    await logUserAction(
      "REGISTER",
      newUser.id,
      "Usuario registrado exitosamente"
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `REGISTER-CONFIRMATION-ERROR: Error al registrar usuario: ${error.message}`,
      stack: error.stack,
    });

    if (error.message === "El email ya está registrado") {
      return res.status(409).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Remover contraseña del resultado
    const { password, ...userProfile } = user;

    res.json({
      message: "Perfil obtenido exitosamente",
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `GET-USER: Error obteniendo perfil: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email, role, isActive } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    // Preparar datos de actualización
    const updateData = {};

    if (email) {
      updateData.email = sanitizeInput(email).toLowerCase();
    }

    // Solo admin puede cambiar roles y estado
    if (req.user?.role === userRoles.ADMIN) {
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await User.update(userId, updateData);
    await logUserAction(
      "PROFILE_UPDATE",
      userId,
      "Usuario actualizó su perfil"
    );

    res.json({
      message: "Perfil actualizado exitosamente",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `UPDATE-USERS: Error actualizando perfil: ${error.message}`,
      stack: error.stack,
    });

    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetUserId = req.params.id || userId;

    await User.delete(targetUserId);
    await logUserAction(
      "DELETE_USER",
      targetUserId,
      `Usuario ${userId} eliminó cuenta ${targetUserId}`
    );

    res.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    await writeErrorLog({
      message: `DEL-USERS: Error eliminando usuario: ${error.message}`,
      stack: error.stack,
    });

    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;

    const users = await User.getUsersByRole(role);
    await logUserAction(
      "ADMIN_QUERY",
      req.user.id,
      `Consultó usuarios con rol ${role}`
    );

    res.json({
      message: `Usuarios con rol ${role} obtenidos exitosamente`,
      data: {
        users: users,
        count: users.length,
        role: role,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `GET-USERS: Error obteniendo usuarios por rol: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    await logUserAction(
      "ADMIN_QUERY",
      req.user.id,
      `Consultó todos los usuarios con rol ${req.user?.role}`
    );

    res.json({
      message: "Todos los usuarios obtenidos exitosamente",
      data: {
        users: users,
        count: users.length,
      },
    });
  } catch (error) {
    await writeErrorLog({
      message: `GET-USERS: Error obteniendo todos los usuarios: ${error.message}`,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error interno del servidor",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

module.exports = {
  register,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUsersByRole,
  getAllUsers,
};
