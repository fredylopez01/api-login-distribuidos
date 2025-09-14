const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const { validateLogin } = require("../middleware/validation");

// POST /login - Iniciar sesión
router.post("/login", validateLogin, login);
// POST /logout - Cerrar sesión
// POST /refresh - Renovar token
// GET /validate - Validar token actual

module.exports = router;
