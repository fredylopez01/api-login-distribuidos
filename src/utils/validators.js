const validator = require("validator");
const { userRoles } = require("../models/User");

const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: "El email es requerido" };
  }

  if (!validator.isEmail(email)) {
    return { isValid: false, message: "Formato de email inválido" };
  }

  return { isValid: true };
};

const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "La contraseña es requerida" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 8 caracteres",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra minúscula",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra mayúscula",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos un número",
    };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return {
      isValid: false,
      message:
        "La contraseña debe contener al menos un carácter especial (@$!%*?&)",
    };
  }

  return { isValid: true };
};

const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Eliminar espacios al inicio y final
  return validator.trim(input);
};

const isValidRole = (role) => {
  const validRoles = Object.values(userRoles);
  return validRoles.includes(role);
};

const validateRegistrationData = (userData) => {
  const errors = [];

  // Validar email
  const emailValidation = validateEmail(userData.email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.message);
  }

  // Validar contraseña
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.message);
  }

  // Validar que no haya campos vacíos después de sanitizar
  if (userData.email && !sanitizeInput(userData.email)) {
    errors.push("El email no puede estar vacío");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

const validateLoginData = (loginData) => {
  const errors = [];

  if (!loginData.email) {
    errors.push("El email es requerido");
  }

  if (!loginData.password) {
    errors.push("La contraseña es requerida");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  isValidRole,
  validateRegistrationData,
  validateLoginData,
  isValidUUID,
};
