// Cargar variables de entorno
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./docs/swagger-output.json");
const path = require("path");

// Importar rutas
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const passwordRoutes = require("./src/routes/password");

// Importar servicios
const { verifyConnection } = require("./src/services/emailService");

// Importar middleware (pendientes de implementar)
const logger = require("./src/middleware/logger");
const { verifyToken } = require("./src/middleware/auth");
// const config = require('./src/config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net", // 👈 añade esto
        ],
      },
    },
  })
);

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
};
app.use(cors(corsOptions));

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

// Middleware de logging
app.use(logger.logRequest);
app.use(logger.logError);

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

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Configurar rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password", passwordRoutes);

// Ruta 404 - debe ir al final
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || "development"}`);
  console.log("API de Login lista para recibir requests");

  // Verificar conexión de email
  console.log("Verificando servicio de email...");
  await verifyConnection();
});

module.exports = app;
