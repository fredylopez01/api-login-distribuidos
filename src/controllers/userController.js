/**
 * Controlador de Usuarios
 * Maneja el registro, gestión de usuarios y roles
 * Responsable: David
 */

const { User, userRoles } = require('../models/User');
const { sanitizeInput } = require('../utils/validators');

/**
 * Registrar nuevo usuario
 */
const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Sanitizar datos
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        const userRole = role || userRoles.USER;
        
        // Crear usuario
        const newUser = await User.create({
            email: sanitizedEmail,
            password: password,
            role: userRole
        });
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            data: {
                user: newUser
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error.message);
        
        if (error.message === 'El email ya está registrado') {
            return res.status(409).json({
                message: error.message
            });
        }
        
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Obtener perfil del usuario actual
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }
        
        // Remover contraseña del resultado
        const { password, ...userProfile } = user;
        
        res.json({
            message: 'Perfil obtenido exitosamente',
            data: {
                user: userProfile
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo perfil:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Actualizar perfil del usuario
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { email, role, isActive } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }
        
        // Preparar datos de actualización
        const updateData = {};
        
        if (email) {
            updateData.email = sanitizeInput(email).toLowerCase();
        }
        
        // Solo admin puede cambiar roles y estado
        if (req.user?.role === userRoles.ADMIN) {
            if (role !== undefined) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = isActive;
        }
        
        const updatedUser = await User.update(userId, updateData);
        
        res.json({
            message: 'Perfil actualizado exitosamente',
            data: {
                user: updatedUser
            }
        });
        
    } catch (error) {
        console.error('Error actualizando perfil:', error.message);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({
                message: error.message
            });
        }
        
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Eliminar cuenta de usuario
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        const targetUserId = req.params.id || userId;
        
        if (!userId) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }
        
        // Solo admin puede eliminar otros usuarios
        if (targetUserId !== userId && req.user?.role !== userRoles.ADMIN) {
            return res.status(403).json({
                message: 'No tienes permisos para eliminar este usuario'
            });
        }
        
        await User.delete(targetUserId);
        
        res.json({
            message: 'Usuario eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando usuario:', error.message);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({
                message: error.message
            });
        }
        
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Obtener usuarios por rol (solo admin)
 */
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        
        // Verificar que el usuario sea admin
        if (req.user?.role !== userRoles.ADMIN) {
            return res.status(403).json({
                message: 'Acceso denegado. Solo administradores pueden ver usuarios por rol'
            });
        }
        
        // Validar que el rol sea válido
        if (!Object.values(userRoles).includes(role)) {
            return res.status(400).json({
                message: 'Rol inválido',
                data: {
                    validRoles: Object.values(userRoles)
                }
            });
        }
        
        const users = await User.getUsersByRole(role);
        
        res.json({
            message: `Usuarios con rol ${role} obtenidos exitosamente`,
            data: {
                users: users,
                count: users.length,
                role: role
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo usuarios por rol:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

/**
 * Obtener todos los usuarios (solo admin)
 */
const getAllUsers = async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user?.role !== userRoles.ADMIN) {
            return res.status(403).json({
                message: 'Acceso denegado. Solo administradores pueden ver todos los usuarios'
            });
        }
        
        const users = await User.getAll();
        
        res.json({
            message: 'Todos los usuarios obtenidos exitosamente',
            data: {
                users: users,
                count: users.length
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo todos los usuarios:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor',
            data: process.env.NODE_ENV === 'development' ? { error: error.message } : null
        });
    }
};

module.exports = {
    register,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getUsersByRole,
    getAllUsers
};
