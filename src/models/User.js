/**
 * Modelo de Usuario
 * Define la estructura y operaciones de usuarios
 * Responsable: David
 */

// TODO: Definir estructura de usuario
// - Campos: id, email, password, role, isActive, loginAttempts, lastLogin, etc.
// - Métodos: create, findById, findByEmail, update, delete, etc.

const userRoles = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
};

module.exports = {
    userRoles,
    // Operaciones CRUD de usuarios
};
