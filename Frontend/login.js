const API_LOGIN = "http://localhost:3001"; // /login emas!
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// Agar token mavjud bo‘lsa -> dashboardga o'tkazish
const token = localStorage.getItem("token");
if (token) {
  window.location.href = "/dashboard.html";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "Iltimos, barcha maydonlarni to‘ldiring.";
    return;
  }

  try {
    const res = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login xatosi!");
    }

    // Saqlash
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    window.location.href = "/dashboard.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
