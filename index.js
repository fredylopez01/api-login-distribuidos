/**
 * API de Login con Autenticación por Token
 * Servidor principal de la aplicación
 *
 * @author fredylopez01, santino33, davidrm_py
 * @version 1.0.0
 */

// Cargar variables de entorno
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Importar rutas
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
// const passwordRoutes = require('./src/routes/password'); // Pendiente David

// Importar middleware (pendientes de implementar)
// const logger = require('./src/middleware/logger');
// const config = require('./src/config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet());
app.use(cors());

// Rate limiting - máximo 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (pendiente)
// app.use(logger.logRequest);

// Rutas principales
app.get("/", (req, res) => {
  res.json({
    message: "API de Login con Autenticación por Token activa",
    data: {
      version: "1.0.0",
      status: "active",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        password: "/api/password",
      },
    },
  });
});

// Configurar rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/password', passwordRoutes); // Pendiente David

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    data:
      process.env.NODE_ENV === "development"
        ? { error: err.message, stack: err.stack }
        : null,
  });
});

// Ruta 404 - debe ir al final
app.use((req, res) => {
  res.status(404).json({
    message: `La ruta ${req.originalUrl} no existe`,
    data: {
      method: req.method,
      url: req.originalUrl,
    },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || "development"}`);
  console.log("📝 API de Login lista para recibir requests");
});

module.exports = app;
