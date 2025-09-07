/**
 * Controlador de Autenticación
 * Maneja las operaciones de login, logout y validación de tokens
 * Responsable: Naranjo
 */

// TODO: Implementar funciones de autenticación

const { User } = require('../models/User');
const { validateEmail, validatePassword, sanitizeInput } = require('../utils/validators');
const jwt = require('jsonwebtoken');
// - login(req, res)
async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Validar email y password
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({ message: emailValidation.message });
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ message: passwordValidation.message });
        }
        // Sanitizar email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        // Buscar usuario
        const user = await User.findByEmail(sanitizedEmail);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Verificar si la cuenta está activa
        if (!user.isActive) {
            return res.status(403).json({ message: 'Cuenta bloqueada por intentos fallidos' });
        }
        // Verificar contraseña
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            await User.incrementLoginAttempts(sanitizedEmail);
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        // Resetear intentos de login
        await User.resetLoginAttempts(sanitizedEmail);
        // Generar token JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// - logout(req, res)
// - refreshToken(req, res)
// - validateToken(req, res)

module.exports = {
    login
    // Funciones de autenticación
};
