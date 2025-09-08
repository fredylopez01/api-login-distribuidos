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

/**
 * Middleware para validar solicitud de recuperación de contraseña
 */
const validatePasswordResetRequest = (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: 'Email es requerido'
            });
        }
        
        // Sanitizar y validar email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        const emailValidation = validateEmail(sanitizedEmail);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                message: emailValidation.message
            });
        }
        
        req.body.email = sanitizedEmail;
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación'
        });
    }
};

/**
 * Middleware para validar restablecimiento de contraseña
 */
const validatePasswordReset = (req, res, next) => {
    try {
        const { token, email, newPassword } = req.body;
        
        // Validar campos requeridos
        if (!token || !email || !newPassword) {
            return res.status(400).json({
                message: 'Token, email y nueva contraseña son requeridos'
            });
        }
        
        // Validar email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).json({
                message: 'Formato de email inválido'
            });
        }
        
        // Validar contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Validar fortaleza de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo'
            });
        }
        
        req.body.email = sanitizedEmail;
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación'
        });
    }
};

/**
 * Middleware para validar cambio de contraseña
 */
const validatePasswordChange = (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Validar campos requeridos
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Contraseña actual y nueva contraseña son requeridos'
            });
        }
        
        // Validar que las contraseñas sean diferentes
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: 'La nueva contraseña debe ser diferente a la actual'
            });
        }
        
        // Validar nueva contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Validar fortaleza de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación'
        });
    }
};

/**
 * Middleware para validar token de reseteo
 */
const validateTokenRequest = (req, res, next) => {
    try {
        const { token, email } = req.body;
        
        if (!token || !email) {
            return res.status(400).json({
                message: 'Token y email son requeridos'
            });
        }
        
        // Validar email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).json({
                message: 'Formato de email inválido'
            });
        }
        
        req.body.email = sanitizedEmail;
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno en validación'
        });
    }
};

module.exports = {
    validateUserRegistration,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validatePasswordChange,
    validateTokenRequest,
    validateEmailMiddleware,
    validateRequiredFields
};
