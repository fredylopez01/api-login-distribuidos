const API_BASE = "http://localhost:3000/api";
const resetForm = document.querySelector("form");
const resetBtn = document.querySelector(".reset-btn");

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

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const code = document.getElementById("code").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validaciones
  if (!email || !code || !password) {
    showAlert("Por favor completa todos los campos.");
    return;
  }

  if (!validateEmail(email)) {
    showAlert("Por favor ingresa un correo válido.");
    return;
  }

  if (password.length < 6) {
    showAlert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  resetBtn.disabled = true;
  resetBtn.textContent = "Actualizando...";

  try {
    const response = await fetch(`${API_BASE}/password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: code,
        email: email,
        newPassword: password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showAlert("Contraseña actualizada correctamente.", "success");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      showAlert(result.message || "Error al restablecer la contraseña.");
    }
  } catch (err) {
    console.error("Reset password error:", err);
    showAlert("Error de conexión con el servidor.");
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = "Actualizar contraseña";
  }
});

// Verificar si ya está autenticado
function checkAuthStatus() {
  const token = localStorage.getItem("authToken");
  const currentPath = window.location.pathname;

  if (token && currentPath === "/login") {
    window.location.href = "/dashboard";
  }
}
