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
        ? "#2563eb"
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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value;
  const password = document.getElementById("password").value;

  if (!identifier || !password) {
    showAlert("Por favor, completa todos los campos.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showAlert("¡Login exitoso! Redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } else {
      if (response.status === 423) {
        showAlert(data.message, "warning");
      } else {
        showAlert(data.message || "Error en el login.");
      }
    }
  } catch (error) {
    showAlert("Error de conexión. Intenta de nuevo.");
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
});

function showForgotPassword() {
  window.location.href = "/demo/forgot-password";
}

function goToRegister() {
  window.location.href = "/register";
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
