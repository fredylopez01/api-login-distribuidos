const API_BASE = "http://localhost:3000";
const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const loading = document.getElementById("loading");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

function showAlert(message, type = "error") {
  let icon = "error";
  if (type === "success") icon = "success";
  else if (type === "warning") icon = "warning";

  Swal.fire({
    text: message,
    icon: icon,
    confirmButtonColor:
      icon === "success"
        ? "#10b981"
        : icon === "warning"
        ? "#fb8500"
        : "#d90429",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
  });
}

function setLoading(isLoading) {
  if (isLoading) {
    loading.style.display = "block";
    registerBtn.disabled = true;
    registerBtn.textContent = "Creando...";
  } else {
    loading.style.display = "none";
    registerBtn.disabled = false;
    registerBtn.textContent = "Crear Cuenta";
  }
}

function showFieldError(fieldId, message) {
  const inputGroup = document.getElementById(fieldId).parentNode;
  inputGroup.classList.add("error");
  inputGroup.classList.remove("success");
  inputGroup.querySelector(".field-error").textContent = message;
}

function showFieldSuccess(fieldId) {
  const inputGroup = document.getElementById(fieldId).parentNode;
  inputGroup.classList.add("success");
  inputGroup.classList.remove("error");
  inputGroup.querySelector(".field-error").textContent = "";
}

function clearFieldError(fieldId) {
  const inputGroup = document.getElementById(fieldId).parentNode;
  inputGroup.classList.remove("error", "success");
  inputGroup.querySelector(".field-error").textContent = "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  // Update visual requirements
  document.getElementById("req-length").className = requirements.length
    ? "valid"
    : "";
  document.getElementById("req-upper").className = requirements.upper
    ? "valid"
    : "";
  document.getElementById("req-lower").className = requirements.lower
    ? "valid"
    : "";
  document.getElementById("req-number").className = requirements.number
    ? "valid"
    : "";

  return Object.values(requirements).every((req) => req);
}

async function apiRequest(endpoint, method, data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error de conexión con el servidor",
    };
  }
}

// Validación en tiempo real
document.getElementById("username").addEventListener("blur", function () {
  const username = this.value.trim();
  if (username && !validateUsername(username)) {
    showFieldError(
      "username",
      "Usuario debe tener 3-20 caracteres (solo letras, números y _)"
    );
  } else if (username) {
    showFieldSuccess("username");
  }
});

document.getElementById("email").addEventListener("blur", function () {
  const email = this.value.trim();
  if (email && !validateEmail(email)) {
    showFieldError("email", "Formato de email inválido");
  } else if (email) {
    showFieldSuccess("email");
  }
});

passwordInput.addEventListener("input", function () {
  const password = this.value;
  const isValid = validatePassword(password);

  if (password) {
    if (isValid) {
      showFieldSuccess("password");
    } else {
      // No mostrar error hasta que termine de escribir
      clearFieldError("password");
    }
  }

  // Validar confirmación si ya tiene texto
  if (confirmPasswordInput.value) {
    validatePasswordConfirmation();
  }
});

function validatePasswordConfirmation() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword && password !== confirmPassword) {
    showFieldError("confirmPassword", "Las contraseñas no coinciden");
    return false;
  } else if (confirmPassword && password === confirmPassword) {
    showFieldSuccess("confirmPassword");
    return true;
  }
  return true;
}

confirmPasswordInput.addEventListener("input", validatePasswordConfirmation);

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;

  let hasErrors = false;

  // Validaciones
  if (!username) {
    showFieldError("username", "El nombre de usuario es requerido");
    hasErrors = true;
  } else if (!validateUsername(username)) {
    showFieldError(
      "username",
      "Usuario debe tener 3-20 caracteres (solo letras, números y _)"
    );
    hasErrors = true;
  }

  if (!email) {
    showFieldError("email", "El email es requerido");
    hasErrors = true;
  } else if (!validateEmail(email)) {
    showFieldError("email", "Formato de email inválido");
    hasErrors = true;
  }

  if (!password) {
    showFieldError("password", "La contraseña es requerida");
    hasErrors = true;
  } else if (!validatePassword(password)) {
    showFieldError("password", "La contraseña no cumple con los requisitos");
    hasErrors = true;
  }

  if (!confirmPassword) {
    showFieldError("confirmPassword", "Debes confirmar la contraseña");
    hasErrors = true;
  } else if (password !== confirmPassword) {
    showFieldError("confirmPassword", "Las contraseñas no coinciden");
    hasErrors = true;
  }

  if (!role) {
    showFieldError("role", "Debes seleccionar un rol");
    hasErrors = true;
  }

  if (hasErrors) {
    showAlert("Por favor, corrige los errores en el formulario.");
    return;
  }

  setLoading(true);

  try {
    const result = await apiRequest("/users/register", "POST", {
      username,
      email,
      password,
      role,
    });

    if (result.success) {
      showAlert(
        "¡Cuenta creada exitosamente! Redirigiendo al login...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      if (result.status === 409) {
        showAlert("Ya existe un usuario con ese email o nombre de usuario.");
        if (result.data?.field === "email") {
          showFieldError("email", "Este email ya está registrado");
        } else if (result.data?.field === "username") {
          showFieldError("username", "Este nombre de usuario ya está en uso");
        }
      } else if (result.status === 400) {
        showAlert("Datos inválidos. Revisa la información ingresada.");
      } else {
        showAlert(result.data?.message || "Error en el servidor.");
      }
    }
  } catch (error) {
    showAlert("Error de conexión. Intenta de nuevo.");
    console.error("Register error:", error);
  } finally {
    setLoading(false);
  }
});

// Limpiar errores al escribir
document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("focus", () => {
    clearFieldError(input.id);
  });
});

// Verificar si ya está autenticado
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    window.location.href = "/dashboard";
  }
});
