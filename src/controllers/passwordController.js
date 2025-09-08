/**
 * Controlador de Recuperación de Contraseñas
 * Maneja el envío de correos y cambio de contraseñas
 * Responsable: David
 */

const { User } = require('../models/User');
const { readResetTokens, writeResetTokens } = require('../services/fileService');
const { hashPassword } = require('../services/encryptionService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const { sanitizeInput } = require('../utils/validators');

/**
 * Generar contraseña temporal que cumpla con las validaciones
 * @returns {string} Contraseña temporal válida
 */
function generateTemporaryPassword() {
    const chars = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        special: '@$!%*?&'
    };
    
    // Asegurar al menos un carácter de cada tipo
    let password = '';
    password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
    password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
    password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
    password += chars.special[Math.floor(Math.random() * chars.special.length)];
    
    // Completar hasta 12 caracteres con caracteres aleatorios
    const allChars = chars.uppercase + chars.lowercase + chars.numbers + chars.special;
    for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar los caracteres para que no sigan un patrón predecible
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        // Verificar si el usuario existe
        const user = await User.findByEmail(sanitizedEmail);
        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            return res.status(200).json({
                message: 'Si el email existe en nuestro sistema, recibirás un correo con las instrucciones'
            });
        }

        // Verificar si el usuario está activo
        if (!user.isActive) {
            return res.status(400).json({
                message: 'Esta cuenta está bloqueada. Contacta al administrador'
            });
        }

        // Generar contraseña temporal que cumpla con las validaciones
        const resetToken = generateTemporaryPassword();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Guardar token de reseteo
        const resetTokens = await readResetTokens();
        
        // Eliminar tokens previos para este email
        const filteredTokens = resetTokens.filter(token => token.email !== sanitizedEmail);
        
        filteredTokens.push({
            email: sanitizedEmail,
            token: resetToken,
            expiresAt: expiresAt.toISOString(),
            used: false,
            createdAt: new Date().toISOString()
        });

        await writeResetTokens(filteredTokens);

        // Enviar correo con contraseña temporal
        const emailSent = await sendPasswordResetEmail(sanitizedEmail, resetToken);
        
        if (!emailSent) {
            return res.status(500).json({
                message: 'Error al enviar el correo de recuperación'
            });
        }

        res.status(200).json({
            message: 'Si el email existe en nuestro sistema, recibirás un correo con una contraseña temporal'
        });

    } catch (error) {
        console.error('Error en solicitud de recuperación:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Restablecer contraseña con token
 */
const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        // Buscar y validar token
        const resetTokens = await readResetTokens();
        const tokenRecord = resetTokens.find(t => 
            t.token === token && 
            t.email === sanitizedEmail && 
            !t.used
        );

        if (!tokenRecord) {
            return res.status(400).json({
                message: 'Token inválido o expirado'
            });
        }

        // Verificar expiración
        if (new Date() > new Date(tokenRecord.expiresAt)) {
            return res.status(400).json({
                message: 'Token expirado'
            });
        }

        // Verificar que el usuario existe
        const user = await User.findByEmail(sanitizedEmail);
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar contraseña
        await User.update(user.id, { password: newPassword });

        // Marcar token como usado
        const updatedTokens = resetTokens.map(t => 
            t.token === token ? { ...t, used: true, usedAt: new Date().toISOString() } : t
        );
        await writeResetTokens(updatedTokens);

        res.status(200).json({
            message: 'Contraseña restablecida exitosamente'
        });

    } catch (error) {
        console.error('Error en restablecimiento:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Cambiar contraseña (usuario autenticado)
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Viene del middleware de autenticación

        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValid = await User.verifyPassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                message: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        await User.update(userId, { password: newPassword });

        res.status(200).json({
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error en cambio de contraseña:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Validar token de reseteo
 */
const validateResetToken = async (req, res) => {
    try {
        const { token, email } = req.body;
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        // Buscar token
        const resetTokens = await readResetTokens();
        const tokenRecord = resetTokens.find(t => 
            t.token === token && 
            t.email === sanitizedEmail && 
            !t.used
        );

        if (!tokenRecord) {
            return res.status(400).json({
                message: 'Token inválido',
                data: { valid: false }
            });
        }

        // Verificar expiración
        if (new Date() > new Date(tokenRecord.expiresAt)) {
            return res.status(400).json({
                message: 'Token expirado',
                data: { valid: false }
            });
        }

        res.status(200).json({
            message: 'Token válido',
            data: { 
                valid: true,
                expiresAt: tokenRecord.expiresAt
            }
        });

    } catch (error) {
        console.error('Error en validación de token:', error.message);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword,
    changePassword,
    validateResetToken
};
