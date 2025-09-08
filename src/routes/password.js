/**
 * Rutas de Recuperación de Contraseñas
 * Define endpoints para recuperación y cambio de contraseñas
 * Responsable: David
 */

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { 
    validatePasswordResetRequest,
    validatePasswordReset,
    validatePasswordChange,
    validateTokenRequest
} = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

/**
 * @route POST /api/password/forgot-password
 * @desc Solicitar recuperación de contraseña
 * @access Public
 */
router.post('/forgot-password', 
    validatePasswordResetRequest, 
    passwordController.requestPasswordReset
);

/**
 * @route POST /api/password/reset-password
 * @desc Restablecer contraseña con token
 * @access Public
 */
router.post('/reset-password', 
    validatePasswordReset, 
    passwordController.resetPassword
);

/**
 * @route POST /api/password/change-password
 * @desc Cambiar contraseña (usuario autenticado)
 * @access Private
 */
router.post('/change-password', 
    verifyToken,
    validatePasswordChange, 
    passwordController.changePassword
);

/**
 * @route POST /api/password/validate-token
 * @desc Validar token de reseteo
 * @access Public
 */
router.post('/validate-token', 
    validateTokenRequest, 
    passwordController.validateResetToken
);

module.exports = router;
