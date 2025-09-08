/**
 * Middleware de Logging
 * Registra todas las acciones y errores del sistema
 * Responsable: Naranjo
 */

const { readLogs, writeLogs } = require('../services/fileService');





/**
 * Middleware para registrar cada petición HTTP
 * Guarda método, URL y timestamp en el archivo de logs
 */
const logRequest = async (req, res, next) => {
    const logs = await readLogs();
    logs.push({
        type: 'request',
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
    await writeLogs(logs);
    next();
};

/**
 * Middleware para registrar errores del sistema
 * Guarda mensaje, stack y timestamp en el archivo de logs
 */
const logError = async (err, req, res, next) => {
    const logs = await readLogs();
    logs.push({
        type: 'error',
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });
    await writeLogs(logs);
    next(err);
};

/**
 * Función para registrar acciones específicas de usuario
 * Guarda tipo de acción, usuario, detalles y timestamp en el archivo de logs
 */
const logUserAction = async (action, userId, details) => {
    const logs = await readLogs();
    logs.push({
        type: 'user_action',
        action,
        userId,
        details,
        timestamp: new Date().toISOString(),
    });
    await writeLogs(logs);
};


module.exports = {
    logRequest,
    logError,
    logUserAction
};
