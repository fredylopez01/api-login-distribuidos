const {
  validateRegistrationData,
  validateLoginData,
  sanitizeInput,
  validateEmail,
} = require("../utils/validators");

const validateUserRegistration = (req, res, next) => {
  try {
    if (req.body.email) {
      req.body.email = sanitizeInput(req.body.email).toLowerCase();
    }

    const validation = validateRegistrationData(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: "Datos de registro inválidos",
        data: {
          errors: validation.errors,
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación de registro",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const validateLogin = (req, res, next) => {
  try {
    // Sanitizar datos de entrada
    if (req.body.email) {
      req.body.email = sanitizeInput(req.body.email).toLowerCase();
    }

    // Validar datos
    const validation = validateLoginData(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: "Datos de login inválidos",
        data: {
          errors: validation.errors,
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación de login",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const validateEmailMiddleware = (req, res, next) => {
  try {
    const email = req.body.email || req.params.email || req.query.email;

    if (!email) {
      return res.status(400).json({
        message: "Email es requerido",
      });
    }

    const emailValidation = validateEmail(email);

    if (!emailValidation.isValid) {
      return res.status(400).json({
        message: "Formato de email inválido",
        data: {
          errors: [emailValidation.message],
        },
      });
    }

    req.validatedEmail = sanitizeInput(email).toLowerCase();

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación de email",
      data:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : null,
    });
  }
};

const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Campos requeridos faltantes",
        data: {
          missingFields: missingFields,
        },
      });
    }

    next();
  };
};

const validatePasswordResetRequest = (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email es requerido",
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        message: emailValidation.message,
      });
    }

    req.body.email = sanitizedEmail;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación",
    });
  }
};

const validatePasswordReset = (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;

    // Validar campos requeridos
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        message: "Token, email y nueva contraseña son requeridos",
      });
    }

    // Validar email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        message: "Formato de email inválido",
      });
    }

    // Validar contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Validar fortaleza de contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo",
      });
    }

    req.body.email = sanitizedEmail;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación",
    });
  }
};

const validatePasswordChange = (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validar campos requeridos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Contraseña actual y nueva contraseña son requeridos",
      });
    }

    // Validar que las contraseñas sean diferentes
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "La nueva contraseña debe ser diferente a la actual",
      });
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres",
      });
    }

    // Validar fortaleza de contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación",
    });
  }
};

const validateTokenRequest = (req, res, next) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        message: "Token y email son requeridos",
      });
    }

    // Validar email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        message: "Formato de email inválido",
      });
    }

    req.body.email = sanitizedEmail;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error interno en validación",
    });
  }
};

module.exports = {
  validateUserRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateTokenRequest,
  validateEmailMiddleware,
  validateRequiredFields,
};
