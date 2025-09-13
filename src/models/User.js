const { v4: uuidv4 } = require("uuid");
const { readUsers, writeUsers } = require("../services/fileService");
const {
  hashPassword,
  comparePasswords,
} = require("../services/encryptionService");

const userRoles = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
};

class User {
  constructor(userData) {
    this.id = userData.id || uuidv4();
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || userRoles.USER;
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.loginAttempts = userData.loginAttempts || 0;
    this.lastLogin = userData.lastLogin || null;
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.lockUntil = null;
  }

  // Crear nuevo usuario
  static async create(userData) {
    const users = await readUsers();

    // Verificar si el email ya existe
    const existingUser = users.find((user) => user.email === userData.email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Encriptar contraseña usando el servicio
    const hashedPassword = await hashPassword(userData.password);

    // Crear nuevo usuario
    const newUser = new User({
      ...userData,
      password: hashedPassword,
    });

    users.push(newUser);
    await writeUsers(users);

    // Retornar usuario sin contraseña
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const users = await readUsers();
    return users.find((user) => user.email === email);
  }

  // Buscar usuario por ID
  static async findById(id) {
    const users = await readUsers();
    return users.find((user) => user.id === id);
  }

  // Actualizar usuario
  static async update(id, updateData) {
    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    // Si se actualiza la contraseña, encriptarla usando el servicio
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await writeUsers(users);

    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  // Eliminar usuario
  static async delete(id) {
    const users = await readUsers();
    const filteredUsers = users.filter((user) => user.id !== id);

    if (users.length === filteredUsers.length) {
      throw new Error("Usuario no encontrado");
    }

    await writeUsers(filteredUsers);
    return true;
  }

  // Verificar contraseña temporal (token de reseteo)
  static async verifyTemporaryPassword(email, temporaryPassword) {
    const {
      readResetTokens,
      writeResetTokens,
    } = require("../services/fileService");

    try {
      const resetTokens = await readResetTokens();
      const tokenRecord = resetTokens.find(
        (t) => t.token === temporaryPassword && t.email === email && !t.used
      );

      if (!tokenRecord) {
        return { valid: false, reason: "Token inválido" };
      }

      // Verificar expiración
      if (new Date() > new Date(tokenRecord.expiresAt)) {
        return { valid: false, reason: "Token expirado" };
      }

      // Marcar token como usado para login temporal
      const updatedTokens = resetTokens.map((t) =>
        t.token === temporaryPassword
          ? {
              ...t,
              used: true,
              usedAt: new Date().toISOString(),
              usedFor: "login",
            }
          : t
      );
      await writeResetTokens(updatedTokens);

      return { valid: true, requiresPasswordChange: true };
    } catch (error) {
      await writeErrorLog({
        message: `POST-RESET-PASSWORD-ERROR: Error verificando contraseña: ${error.message}`,
        stack: error.stack,
      });
      return { valid: false, reason: "Error interno" };
    }
  }

  // Verificar contraseña usando el servicio de encriptación
  static async verifyPassword(plainPassword, hashedPassword) {
    return await comparePasswords(plainPassword, hashedPassword);
  }

  // Incrementar intentos de login
  static async incrementLoginAttempts(email) {
    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex !== -1) {
      users[userIndex].loginAttempts =
        (users[userIndex].loginAttempts || 0) + 1;
      users[userIndex].updatedAt = new Date().toISOString();

      await writeUsers(users);
    }
  }

  //Bloquear
  static async updateLockUntil(email) {
    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex !== -1) {
      users[userIndex].lockUntil = new Date(
        Date.now() + 15 * 60 * 1000
      ).toISOString(); // bloqueado 15 min

      await writeUsers(users);
    }
  }

  // Resetear intentos de login
  static async resetLoginAttempts(email) {
    const users = await readUsers();
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex !== -1) {
      users[userIndex].loginAttempts = 0;
      users[userIndex].lastLogin = new Date().toISOString();
      users[userIndex].updatedAt = new Date().toISOString();
      users[userIndex].lockUntil = null;
      await writeUsers(users);
    }
  }

  // Obtener usuarios por rol
  static async getUsersByRole(role) {
    const users = await readUsers();
    return users
      .filter((user) => user.role === role)
      .map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  // Obtener todos los usuarios (sin contraseñas)
  static async getAll() {
    const users = await readUsers();
    return users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword
    );
  }
}

module.exports = {
  User,
  userRoles,
};
