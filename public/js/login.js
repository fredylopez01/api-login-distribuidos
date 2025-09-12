const API_BASE = "http://localhost:3000"; // URL de tu backend
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const loading = document.getElementById("loading");

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
    loginBtn.disabled = true;
    loginBtn.textContent = "Iniciando...";
  } else {
    loading.style.display = "none";
    loginBtn.disabled = false;
    loginBtn.textContent = "Iniciar Sesión";
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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;

  if (!identifier || !password) {
    showAlert("Por favor, completa todos los campos.");
    return;
  }

  setLoading(true);

  try {
    const result = await apiRequest("/api/auth/login", "POST", {
      email: identifier,
      password,
    });

    if (result.success) {
      localStorage.setItem("authToken", result.data.token);
      showAlert("¡Login exitoso! Redirigiendo...", "success");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } else {
      if (result.status === 423) {
        showAlert(
          result.data.message || "Cuenta bloqueada temporalmente.",
          "warning"
        );
      } else if (result.status === 401) {
        showAlert(
          "Credenciales incorrectas. Verifica tu usuario y contraseña."
        );
      } else if (result.status === 404) {
        showAlert("Usuario no encontrado. Verifica tus datos.");
      } else {
        showAlert(result.data?.message || "Error en el servidor.");
      }
    }
  } catch (error) {
    showAlert("Error de conexión. Intenta de nuevo.");
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
});

// Verificar si ya está autenticado
function checkAuthStatus() {
  const token = localStorage.getItem("authToken");
  if (token) {
    // Verificar si el token es válido (opcional)
    window.location.href = "/dashboard";
  }
}

// Auto-completar para demo
document.addEventListener("keydown", (e) => {
  if (e.key === "F1") {
    e.preventDefault();
    document.getElementById("identifier").value = "admin";
    document.getElementById("password").value = "admin123";
  } else if (e.key === "F2") {
    e.preventDefault();
    document.getElementById("identifier").value = "nicolas";
    document.getElementById("password").value = "nicolas123";
  }
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

// Limpiar errores al escribir
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.style.borderColor === "rgb(239, 68, 68)") {
      input.style.borderColor = "";
    }
  });
});
