const API_BASE = "http://localhost:3000/api";
const forgotForm = document.getElementById("forgotForm");
const forgotBtn = document.getElementById("forgotBtn");
const loading = document.getElementById("loading");
const successMessage = document.getElementById("successMessage");
const countdown = document.getElementById("countdown");
const resetLink = document.getElementById("resetLink");

let countdownTimer = null;
let cooldownUntil = null;

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
    forgotBtn.disabled = true;
    forgotBtn.textContent = "Enviando...";
  } else {
    loading.style.display = "none";
    forgotBtn.disabled = false;
    forgotBtn.textContent = "Enviar Código de Verificación";
  }
}

function showFieldError(fieldId, message) {
  const inputGroup = document.getElementById(fieldId).parentNode;
  inputGroup.classList.add("error");
  inputGroup.querySelector(".field-error").textContent = message;
}

function clearFieldError(fieldId) {
  const inputGroup = document.getElementById(fieldId).parentNode;
  inputGroup.classList.remove("error");
  inputGroup.querySelector(".field-error").textContent = "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function startCountdown(seconds) {
  let remaining = seconds;
  countdown.classList.add("active");

  countdownTimer = setInterval(() => {
    countdown.textContent = `Podrás enviar otro código en ${remaining} segundos`;
    remaining--;

    if (remaining < 0) {
      clearInterval(countdownTimer);
      countdown.classList.remove("active");
      countdown.textContent = "";
      cooldownUntil = null;
      localStorage.removeItem("forgotPasswordCooldown");
      forgotBtn.disabled = false;
    }
  }, 1000);
}

function checkCooldown() {
  const savedCooldown = localStorage.getItem("forgotPasswordCooldown");
  if (savedCooldown) {
    cooldownUntil = parseInt(savedCooldown);
    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);

    if (remaining > 0) {
      forgotBtn.disabled = true;
      startCountdown(remaining);
    } else {
      localStorage.removeItem("forgotPasswordCooldown");
      cooldownUntil = null;
    }
  }
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

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  // Verificar cooldown
  if (cooldownUntil && Date.now() < cooldownUntil) {
    const remainingTime = Math.ceil((cooldownUntil - Date.now()) / 1000);
    showAlert(`Espera ${remainingTime} segundos antes de enviar otro código.`);
    return;
  }

  // Validaciones
  if (!email) {
    showFieldError("email", "El email es requerido");
    showAlert("Por favor, ingresa tu correo electrónico.");
    return;
  }

  if (!validateEmail(email)) {
    showFieldError("email", "Formato de email inválido");
    showAlert("Por favor, ingresa un email válido.");
    return;
  }

  setLoading(true);
  clearFieldError("email");

  try {
    const result = await apiRequest("/password/forgot-password", "POST", {
      email,
    });

    if (result.success) {
      successMessage.style.display = "block";
      resetLink.style.display = "block";
      showAlert("Código de verificación enviado exitosamente.", "success");

      // Iniciar cooldown de 60 segundos
      cooldownUntil = Date.now() + 60000;
      localStorage.setItem("forgotPasswordCooldown", cooldownUntil.toString());
      forgotBtn.disabled = true;
      startCountdown(60);
    } else {
      successMessage.style.display = "none";
      resetLink.style.display = "none";

      if (result.status === 404) {
        showAlert("No se encontró una cuenta con este email.");
        showFieldError("email", "Email no registrado");
      } else if (result.status === 400) {
        showAlert("Email no válido.");
        showFieldError("email", "Email inválido");
      } else {
        showAlert(result.data?.message || "Error en el servidor.");
      }
    }
  } catch (error) {
    showAlert("Error de conexión. Intenta de nuevo.");
    console.error("Forgot password error:", error);
  } finally {
    setLoading(false);
  }
});

// Limpiar errores al escribir
document.getElementById("email").addEventListener("input", () => {
  clearFieldError("email");
  successMessage.style.display = "none";
});

// Verificar cooldown al cargar
document.addEventListener("DOMContentLoaded", () => {
  checkCooldown();

  // Verificar si ya está autenticado
  const token = localStorage.getItem("authToken");
  if (token) {
    window.location.href = "/dashboard";
  }
});
