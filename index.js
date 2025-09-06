/**
 * API de Login con Autenticación por Token
 * Servidor principal de la aplicación
 * 
 * @author fredylopez01, santino33, davidrm_py
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rutas (pendientes de implementar)
// const authRoutes = require('./src/routes/auth');
// const userRoutes = require('./src/routes/users');
// const passwordRoutes = require('./src/routes/password');

// Importar middleware (pendientes de implementar)
// const logger = require('./src/middleware/logger');
// const config = require('./src/config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet());
app.use(cors());

// Rate limiting 
const limiter = rateLimit({
   
});
app.use(limiter);

// Middleware para parsing JSON


// Middleware de logging (pendiente)
// app.use(logger.logRequest);

// Rutas principales
app.get('/', (req, res) => {
   
});

// TODO: Configurar rutas cuando estén implementadas
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/password', passwordRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
   
});

// Ruta 404
app.use('*', (req, res) => {
    
});

// Iniciar servidor
app.listen(PORT, () => {
   
});

module.exports = app;
