/**
 * Servicio de Encriptación
 * Maneja encriptación de datos sensibles
 * Responsable: David
 */

// TODO: Implementar encriptación
// - Funciones para encriptar/desencriptar datos
// - Encriptación de correos en logs
// - Hashing de contraseñas con bcrypt

const bcrypt = require("bcrypt");

/**
 * Encripta una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña encriptada
 */
async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_ROUNDS);
  return hashedPassword;
}

/**
 * Compara una contraseña en texto plano con su versión encriptada
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada
 * @returns {Promise<boolean>} true si coinciden, false si no
 */
async function comparePasswords(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePasswords,
};

module.exports = {
  // Funciones de encriptación
};
