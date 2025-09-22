const API_BASE = "http://192.168.11.11:3001/netping";
let currentACIp = null;
const isUsersPage = !!document.querySelector("#userTable");
const isDevicesPage = !!document.querySelector("#sensorTable");
const isDashboardPage = !!document.querySelector("#deviceCards");

function doorBadge(val) {
  return val === "0"
    ? `<span class="badge bg-success"><i class="fa-solid fa-door-closed"></i> Yopiq</span>`
    : `<span class="badge bg-danger"><i class="fa-solid fa-door-open"></i> Ochiq</span>`;
}

function movementBadge(val) {
  return val === "1"
    ? `<span class="badge bg-success"><i class="fa-solid fa-person-walking"></i> Harakat bor</span>`
    : `<span class="badge bg-success"><i class="fa-solid fa-person-walking"></i> Harakat yo‘q</span>`; // yashil bo'lishi kerak
}

function fireBadge(val) {
  return val === "0"
    ? `<span class="badge bg-danger"><i class="fa-solid fa-fire"></i> Yong‘in bor</span>`
    : `<span class="badge bg-success"><i class="fa-solid fa-fire"></i> Yong‘in yo‘q</span>`;
}

function alarmBadge(val) {
  return val === "1"
    ? `<span class="badge bg-success"><i class="fa-solid fa-bell-slash"></i> Signal yo‘q</span>`
    : `<span class="badge bg-danger"><i class="fa-solid fa-bell"></i> Signal ochiq</span>`;
}

async function setAlarm(ip, action) {
  try {
    const res = await fetch(`${API_BASE}/alarm/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    const data = await res.json();
    alert(data.message);
    loadData();
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

function renderDeviceCards(devices) {
  const container = document.querySelector("#deviceCards");
  if (!container) return;

  container.innerHTML = devices
    .map(
      (dev) => `
    <div class="col-md-4">
  <div class="device-card">
    <h5>${dev.name}</h5>
    <small class="text-muted">${dev.ip}</small>
    <hr>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-thermometer-half text-success"></i> Temp
      </div>
      <div class="sensor-value">
        ${dev.sensors.temperature ? dev.sensors.temperature + " °C" : "-"}
      </div>
    </div>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-droplet text-info"></i> Humidity
      </div>
      <div class="sensor-value">
        ${dev.sensors.humidity ? dev.sensors.humidity + " %" : "-"}
      </div>
    </div>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-door-closed text-primary"></i> Door
      </div>
      <div class="sensor-value">${doorBadge(dev.sensors.door)}</div>
    </div>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-person-walking text-warning"></i> Movement
      </div>
      <div class="sensor-value">${movementBadge(dev.sensors.movement)}</div>
    </div>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-fire text-danger"></i> Fire
      </div>
      <div class="sensor-value">${fireBadge(dev.sensors.fire)}</div>
    </div>

    <div class="sensor-item">
      <div class="sensor-label">
        <i class="bi bi-bell text-danger"></i> Alarm
      </div>
      <div class="sensor-value">${alarmBadge(dev.sensors.alarm)}</div>
    </div>
  </div>
</div>

  `
    )
    .join("");
}

// ------------ DEVICES (faqat devices.html da) ------------
function renderTable(devices) {
  const tbody = document.querySelector("#sensorTable tbody");
  if (!tbody) return; // guard
  tbody.innerHTML = "";
  devices.forEach((dev) => {
    tbody.innerHTML += `
      <tr>
        <td>${dev.name}</td>
        <td>${dev.ip}</td>
        <td>${dev.sensors.temperature}</td>
        <td>${dev.sensors.humidity}</td>
        <td>${doorBadge(dev.sensors.door)}</td>
        <td>${movementBadge(dev.sensors.movement)}</td>
        <td>${fireBadge(dev.sensors.fire)}</td>
        <td>
          ${alarmBadge(dev.sensors.alarm)}
          <div class="mt-1">
            <button class="btn btn-sm btn-outline-success me-1" onclick="setAlarm('${
              dev.ip
            }','on')">Yoqish</button>
            <button class="btn btn-sm btn-outline-danger" onclick="setAlarm('${
              dev.ip
            }','off')">O‘chirish</button>
          </div>
        </td>
        <td class="text-center">
          <button class="ac-btn" onclick="openAcModal('${dev.acIP}')">
            <i class="bi bi-file-spreadsheet"></i>
          </button>
        </td>
      </tr>`;
  });
}

// Pulutcha modalni ochish
function openAcModal(ip) {
  currentACIp = ip;
  const acModal = new bootstrap.Modal(document.getElementById("acModal"));
  acModal.show();
}

// Pulutcha boshqaruv buyruqlari
async function sendACCommand(cmd) {
  try {
    console.log(cmd);

    const res = await fetch(`${API_BASE}/pulut/${cmd}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: currentACIp, command: cmd }),
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}
async function loadDevices() {
  try {
    const res = await fetch(`${API_BASE}/data`);
    const devices = await res.json();
    renderDeviceCards(devices);
  } catch (err) {
    console.error("Devices olishda xatolik:", err);
  }
}
async function loadData() {
  if (!isDevicesPage) return; // faqat devices sahifada
  try {
    const res = await fetch(`${API_BASE}/data`);
    const devices = await res.json();
    renderTable(devices);
  } catch (err) {
    console.error("Device ma'lumotlarini olishda xato:", err);
  }
}

// Devices form listenerini guard bilan yozing
const addDeviceForm = document.getElementById("addDeviceForm");
if (addDeviceForm) {
  addDeviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/addNetPing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return alert("Xatolik: " + (data.message || res.status));
      alert("Device qo‘shildi!");
      loadData();
      loadDevices();
      e.target.reset();
      (
        bootstrap.Modal.getInstance(
          document.getElementById("addDeviceModal")
        ) ||
        bootstrap.Modal.getOrCreateInstance(
          document.getElementById("addDeviceModal")
        )
      ).hide();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  });
}

// ------------ USERS (faqat user.html da) ------------
function renderUserTable(users) {
  const tbody = document.querySelector("#userTable tbody");
  if (!tbody) return; // guard
  tbody.innerHTML = "";
  users.forEach((user) => {
    tbody.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.username}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </td>
      </tr>`;
  });
}

async function loadUsers() {
  if (!isUsersPage) return; // faqat users sahifada
  try {
    const res = await fetch(`${API_BASE}/users`);
    const users = await res.json();
    renderUserTable(users);
  } catch (err) {
    console.error("Userlarni olishda xato:", err);
  }
}

// Add User (faqat users sahifada)
const addUserForm = document.getElementById("addUserForm");
if (addUserForm) {
  addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch(`${API_BASE}/addUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return alert("Xatolik: " + (data.message || res.status));
      alert(data.message || "User qo‘shildi!");
      loadUsers();
      e.target.reset();
      (
        bootstrap.Modal.getInstance(document.getElementById("addUserModal")) ||
        bootstrap.Modal.getOrCreateInstance(
          document.getElementById("addUserModal")
        )
      ).hide();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  });
}

// Delete User (hamma sahifada ishlashi mumkin, lekin chaqiruvchi tugma users sahifasida)
async function deleteUser(username) {
  if (!confirm(`${username} ni o‘chirishni xohlaysizmi?`)) return;
  try {
    const res = await fetch(`${API_BASE}/deleteUser`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) return alert("Xatolik: " + (data.message || res.status));
    alert(data.message || "User o‘chirildi!");
    loadUsers();
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

// ------------ Sahifa bo‘yicha ishga tushirish ------------
document.addEventListener("DOMContentLoaded", () => {
  if (isDevicesPage) {
    loadData();
    setInterval(loadData, 3000);
  }
  if (isUsersPage) {
    loadUsers();
    // interval user.html ichidagi inline skriptga ko‘chirildi
  }
  if (isDashboardPage) {
    loadDevices();
    setInterval(loadDevices, 3000);
  }
});
async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: "POST" });
    localStorage.removeItem("token"); // tokenni o‘chir
    window.location.href = "login.html"; // login sahifaga qaytar
  } catch (err) {
    alert("Logoutda xatolik: " + err.message);
  }
}

loadData();
loadDevices;
