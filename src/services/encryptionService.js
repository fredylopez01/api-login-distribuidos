/**
 * Servicio de Encriptación
 * Maneja encriptación de datos sensibles
 * Responsable: David
 */

const bcrypt = require("bcrypt");

/**
 * Encripta una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña encriptada
 */
async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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

/**
 * Encripta datos sensibles para logs
 * @param {string} data - Datos a encriptar
 * @returns {string} Datos encriptados
 */
function encryptSensitiveData(data) {
    // TODO: Implementar encriptación para logs
    // Por ahora, parcialmente ocultar emails
    if (data.includes('@')) {
        const [user, domain] = data.split('@');
        return `${user.substring(0, 2)}***@${domain}`;
    }
    return data;
}

module.exports = {
    hashPassword,
    comparePasswords,
    encryptSensitiveData
};
