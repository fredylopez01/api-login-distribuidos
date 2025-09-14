document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const userBtn = document.getElementById("userBtn");
  const navLinks = document.querySelectorAll(".sidebar nav a");
  const sections = document.querySelectorAll(".section");

  // Estadísticas
  const totalUsers = document.getElementById("totalUsers");
  const activeUsers = document.getElementById("activeUsers");
  const inactiveUsers = document.getElementById("inactiveUsers");
  const usersTableBody = document.getElementById("usersTableBody");

  // Gestión de usuarios
  const roleFilter = document.getElementById("roleFilter");
  const manageUsersTable = document.getElementById("manageUsersTable");
  const addUserBtn = document.getElementById("addUserBtn");

  // Perfil
  const profileForm = document.getElementById("profileForm");
  const profileEmail = document.getElementById("profileEmail");
  const profilePassword = document.getElementById("profilePassword");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");

  // ===== NAV =====
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach((s) => s.classList.add("hidden"));
      const target = link.dataset.section + "Section";
      document.getElementById(target).classList.remove("hidden");

      document.getElementById("sectionTitle").textContent = link.textContent;
    });
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  });

  // ===== PERFIL =====
  async function loadProfile() {
    try {
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error perfil");
      const data = await res.json();
      const user = data.data.user;

      userBtn.textContent = `👤 ${user.email}`;
      profileEmail.value = user.email;
    } catch {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: profileEmail.value,
          ...(profilePassword.value ? { password: profilePassword.value } : {}),
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar perfil");
      alert("Perfil actualizado!");
      profilePassword.value = "";
      loadProfile();
    } catch (err) {
      alert(err.message);
    }
  });

  deleteAccountBtn.addEventListener("click", async () => {
    if (!confirm("¿Seguro que deseas eliminar tu cuenta?")) return;
    try {
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar cuenta");
      alert("Cuenta eliminada");
      localStorage.removeItem("authToken");
      window.location.href = "/register";
    } catch (err) {
      alert(err.message);
    }
  });

  // ===== USUARIOS =====
  async function loadUsers(role = "all") {
    try {
      const url = role === "all" ? "/api/users" : `/api/users/role/${role}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error usuarios");
      const data = await res.json();
      const users = data.data.users;

      // estadísticas en home
      totalUsers.textContent = users.length;
      activeUsers.textContent = users.filter((u) => u.isActive).length;
      inactiveUsers.textContent = users.filter((u) => !u.isActive).length;

      // tabla en home
      usersTableBody.innerHTML = "";
      users.slice(0, 10).forEach((u) => {
        usersTableBody.innerHTML += `
          <tr>
            <td>${u.id}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td><span class="status ${u.isActive ? "active" : "inactive"}">${
          u.isActive ? "Activo" : "Inactivo"
        }</span></td>
          </tr>`;
      });

      // tabla en gestión
      manageUsersTable.innerHTML = "";
      users.forEach((u) => {
        manageUsersTable.innerHTML += `
          <tr>
            <td>#${u.id}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td><span class="status ${u.isActive ? "active" : "inactive"}">${
          u.isActive ? "Activo" : "Inactivo"
        }</span></td>
            <td>
              <button class="danger deleteUserBtn" data-id="${
                u.id
              }">Eliminar</button>
            </td>
          </tr>`;
      });

      // event eliminar
      document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar este usuario?")) return;
          try {
            const res = await fetch(`/api/users/${btn.dataset.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Error al eliminar usuario");
            alert("Usuario eliminado");
            loadUsers(role);
          } catch (err) {
            alert(err.message);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  roleFilter.addEventListener("change", () => {
    loadUsers(roleFilter.value);
  });

  addUserBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/register";
  });

  // init
  loadProfile();
  loadUsers();
});
