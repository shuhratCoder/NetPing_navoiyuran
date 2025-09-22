const API_LOGIN = "http://192.168.11.11:3001"; // backend login endpoint

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const token = localStorage.getItem("token");
if (token) {
  fetch("/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "name", password: "password" }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error("Error:", err));
  window.location.href = "/"; // Agar token mavjud bo'lsa, asosiy sahifaga yo'naltirish
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

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Login xatosi");
    }

    const data = await res.json();
    // Token va role'ni localStorage ga saqlash
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    // Rolga qarab yo'naltirish
    if (data.role === "admin") {
      window.location.href = "/dashboard.html";
    } else {
      window.location.href = "/user.html";
    }
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
