/**
 * Servicio de Persistencia
 * Maneja la lectura/escritura de archivos planos
 * Responsable: Todos
 */

const fs = require('fs').promises;
const dbConfig = require('../config/database');

/**
 * Lee usuarios del archivo JSON
 * @returns {Promise<Array>} Array de usuarios
 */
async function readUsers() {
    try {
        const data = await fs.readFile(dbConfig.users.path, dbConfig.users.encoding);
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Escribe usuarios al archivo JSON
 * @param {Array} users - Array de usuarios a escribir
 * @returns {Promise<void>}
 */
async function writeUsers(users) {
    await fs.writeFile(dbConfig.users.path, JSON.stringify(users, null, 2));
}

/**
 * Lee tokens de reseteo del archivo JSON
 * @returns {Promise<Array>} Array de tokens
 */
async function readResetTokens() {
    try {
        const data = await fs.readFile(dbConfig.resetTokens.path, dbConfig.resetTokens.encoding);
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Escribe tokens de reseteo al archivo JSON
 * @param {Array} tokens - Array de tokens a escribir
 * @returns {Promise<void>}
 */
async function writeResetTokens(tokens) {
    await fs.writeFile(dbConfig.resetTokens.path, JSON.stringify(tokens, null, 2));
}

/**
 * Lee logs del archivo JSON
 * @returns {Promise<Array>} Array de logs
 */
async function readLogs() {
    try {
        const data = await fs.readFile(dbConfig.logs.path, dbConfig.logs.encoding);
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Escribe logs al archivo JSON
 * @param {Array} logs - Array de logs a escribir
 * @returns {Promise<void>}
 */
async function writeLogs(logs) {
    await fs.writeFile(dbConfig.logs.path, JSON.stringify(logs, null, 2));
}

module.exports = {
    readUsers,
    writeUsers,
    readResetTokens,
    writeResetTokens,
    readLogs,
    writeLogs
};
