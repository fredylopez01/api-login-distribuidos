/**
 * Middleware de Validación
 * Valida datos de entrada en requests
 * Responsable: David
 */

const { 
    validateRegistrationData, 
    validateLoginData, 
    sanitizeInput,
    validateEmail
} = require('../utils/validators');

/**
 * Middleware para validar registro de usuario
 */
const validateUserRegistration = (req, res, next) => {
    try {
        // Sanitizar datos de entrada
        if (req.body.email) {
            req.body.email = sanitizeInput(req.body.email).toLowerCase();
        }
        
        // Validar datos
        const validation = validateRegistrationData(req.body);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Datos de registro inválidos',
                data: {
                    errors: validation.errors
                }
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación de registro',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Middleware para validar login
 */
const validateLogin = (req, res, next) => {
    try {
        // Sanitizar datos de entrada
        if (req.body.email) {
            req.body.email = sanitizeInput(req.body.email).toLowerCase();
        }
        
        // Validar datos
        const validation = validateLoginData(req.body);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Datos de login inválidos',
                data: {
                    errors: validation.errors
                }
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación de login',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Middleware para validar email de recuperación
 */
const validatePasswordReset = (req, res, next) => {
    try {
        if (req.body.email) {
            req.body.email = sanitizeInput(req.body.email).toLowerCase();
        }
        
        const emailValidation = validateEmail(req.body.email);
        
        if (!emailValidation.isValid) {
            return res.status(400).json({
                message: 'Email inválido para recuperación',
                data: {
                    errors: [emailValidation.message]
                }
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación de recuperación',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Middleware genérico para validar email
 */
const validateEmailMiddleware = (req, res, next) => {
    try {
        const email = req.body.email || req.params.email || req.query.email;
        
        if (!email) {
            return res.status(400).json({
                message: 'Email es requerido'
            });
        }
        
        const emailValidation = validateEmail(email);
        
        if (!emailValidation.isValid) {
            return res.status(400).json({
                message: 'Formato de email inválido',
                data: {
                    errors: [emailValidation.message]
                }
            });
        }
        
        // Sanitizar y guardar en req para uso posterior
        req.validatedEmail = sanitizeInput(email).toLowerCase();
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación de email',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Middleware para validar que los campos requeridos estén presentes
 */
const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Campos requeridos faltantes',
                data: {
                    missingFields: missingFields
                }
            });
        }
        
        next();
    };
};

module.exports = {
    validateUserRegistration,
    validateLogin,
    validatePasswordReset,
    validateEmailMiddleware,
    validateRequiredFields
};
