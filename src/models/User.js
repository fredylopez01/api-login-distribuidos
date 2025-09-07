/**
 * Modelo de Usuario
 * Define la estructura y operaciones de usuarios
 * Responsable: David
 */

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const userRoles = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
};

const USERS_FILE = path.join(__dirname, '../../data/users.json');

class User {
    constructor(userData) {
        this.id = userData.id || uuidv4();
        this.email = userData.email;
        this.password = userData.password;
        this.role = userData.role || userRoles.USER;
        this.isActive = userData.isActive !== undefined ? userData.isActive : true;
        this.loginAttempts = userData.loginAttempts || 0;
        this.lastLogin = userData.lastLogin || null;
        this.createdAt = userData.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    // Leer usuarios del archivo
    static async readUsers() {
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    // Escribir usuarios al archivo
    static async writeUsers(users) {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }

    // Crear nuevo usuario
    static async create(userData) {
        const users = await User.readUsers();
        
        // Verificar si el email ya existe
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Encriptar contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Crear nuevo usuario
        const newUser = new User({
            ...userData,
            password: hashedPassword
        });

        users.push(newUser);
        await User.writeUsers(users);

        // Retornar usuario sin contraseña
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        const users = await User.readUsers();
        return users.find(user => user.email === email);
    }

    // Buscar usuario por ID
    static async findById(id) {
        const users = await User.readUsers();
        return users.find(user => user.id === id);
    }

    // Actualizar usuario
    static async update(id, updateData) {
        const users = await User.readUsers();
        const userIndex = users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // Si se actualiza la contraseña, encriptarla
        if (updateData.password) {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await User.writeUsers(users);
        
        const { password, ...userWithoutPassword } = users[userIndex];
        return userWithoutPassword;
    }

    // Eliminar usuario
    static async delete(id) {
        const users = await User.readUsers();
        const filteredUsers = users.filter(user => user.id !== id);
        
        if (users.length === filteredUsers.length) {
            throw new Error('Usuario no encontrado');
        }

        await User.writeUsers(filteredUsers);
        return true;
    }

    // Verificar contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Incrementar intentos de login
    static async incrementLoginAttempts(email) {
        const users = await User.readUsers();
        const userIndex = users.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].loginAttempts = (users[userIndex].loginAttempts || 0) + 1;
            users[userIndex].updatedAt = new Date().toISOString();
            
            // Bloquear cuenta después de 5 intentos
            if (users[userIndex].loginAttempts >= 5) {
                users[userIndex].isActive = false;
            }
            
            await User.writeUsers(users);
        }
    }

    // Resetear intentos de login
    static async resetLoginAttempts(email) {
        const users = await User.readUsers();
        const userIndex = users.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].loginAttempts = 0;
            users[userIndex].lastLogin = new Date().toISOString();
            users[userIndex].updatedAt = new Date().toISOString();
            await User.writeUsers(users);
        }
    }

    // Obtener usuarios por rol
    static async getUsersByRole(role) {
        const users = await User.readUsers();
        return users
            .filter(user => user.role === role)
            .map(({ password, ...userWithoutPassword }) => userWithoutPassword);
    }

    // Obtener todos los usuarios (sin contraseñas)
    static async getAll() {
        const users = await User.readUsers();
        return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
    }
}

module.exports = {
    User,
    userRoles
};
