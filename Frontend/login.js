const API_LOGIN = "/";
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const token = localStorage.getItem("token");
if (token) {
  window.location.href = "/dashboard.html";
}
function togglePassword() {
  const password = document.getElementById("password");
  password.type = password.type === "password" ? "text" : "password";
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
      throw new Error(data.message || "Login xatosi");
    }

    // Saqlash
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    window.location.href = "/dashboard.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
