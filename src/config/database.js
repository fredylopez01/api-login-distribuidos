/**
 * Configuración de Base de Datos
 * Configuración para archivos planos (JSON)
 * Responsable: Fredy
 */

const path = require('path');

const dbConfig = {
    users: {
        path: path.join(__dirname, '../../data/users.json'),
        encoding: 'utf8'
    },
    resetTokens: {
        path: path.join(__dirname, '../../data/reset_tokens.json'),
        encoding: 'utf8'
    },
    logs: {
        path: path.join(__dirname, '../../data/logs.json'),
        encoding: 'utf8'
    }
};

module.exports = dbConfig;
