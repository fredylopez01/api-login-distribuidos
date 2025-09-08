const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API de Login",
    description:
      "Sistema de login con roles, tokens y recuperación de contraseñas",
    version: "1.0.0",
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    { name: "Auth", description: "Endpoints de autenticación y login" },
    { name: "Users", description: "Gestión de usuarios y roles" },
    { name: "Password", description: "Recuperación y cambio de contraseñas" },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        'JWT Authorization header usando el esquema Bearer. Ejemplo: "Authorization: Bearer {token}"',
    },
  },
};

const outputFile = "./docs/swagger-output.json"; // se generará automáticamente
const endpointsFiles = ["./index.js"]; // archivo que agrupa todas tus rutas

swaggerAutogen(outputFile, endpointsFiles, doc);
