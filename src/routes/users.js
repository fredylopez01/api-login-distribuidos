/**
 * Rutas de Usuarios
 * Define endpoints de registro y gestión de usuarios
 * Responsable: David
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUserRegistration, validateRequiredFields } = require('../middleware/validation');
const { verifyToken, checkRole } = require('../middleware/auth');
const { userRoles } = require('../models/User');

/**
 * POST /api/users/register
 * Registrar nuevo usuario
 * Público
 */
router.post('/register', 
    validateUserRegistration,
    userController.register
);

/**
 * GET /api/users/profile
 * Obtener perfil del usuario actual
 * Requiere autenticación
 */
router.get('/profile', 
    verifyToken,
    userController.getUserProfile
);

/**
 * PUT /api/users/profile
 * Actualizar perfil del usuario actual
 * Requiere autenticación
 */
router.put('/profile', 
    verifyToken,
    validateRequiredFields(['email']),
    userController.updateUserProfile
);

/**
 * DELETE /api/users/profile
 * Eliminar cuenta del usuario actual
 * Requiere autenticación
 */
router.delete('/profile', 
    verifyToken,
    userController.deleteUser
);

/**
 * DELETE /api/users/:id
 * Eliminar usuario específico (solo admin)
 * Requiere autenticación y rol admin
 */
router.delete('/:id', 
    verifyToken,
    checkRole([userRoles.ADMIN]),
    userController.deleteUser
);

/**
 * GET /api/users
 * Listar todos los usuarios (solo admin)
 * Requiere autenticación y rol admin
 */
router.get('/', 
    verifyToken,
    checkRole([userRoles.ADMIN]),
    userController.getAllUsers
);

/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol (solo admin)
 * Requiere autenticación y rol admin
 */
router.get('/role/:role', 
    verifyToken,
    checkRole([userRoles.ADMIN]),
    userController.getUsersByRole
);

module.exports = router;
