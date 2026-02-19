const API_BASE = "http://192.168.8.222:3001/netping";
// Frontend/js/dashboard.js

let currentACIp = null;
const isUsersPage = !!document.querySelector("#userTable");
const isDevicesPage = !!document.querySelector("#sensorTable");
const isDashboardPage = !!document.querySelector("#deviceCards");

// ----------- AUTH YORDAMCHI FUNKSIYALAR -----------

function getToken() {
  return localStorage.getItem("token");
}

function buildHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    // token noto'g'ri yoki yo'q → logout qilib login sahifaga
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
    return;
  }

  return res;
}

// navbar dagi logout tugmasi uchun
function logout() {
  // Agar backendda /netping/logout route bo'lsa, xohlasang chaqirishing mumkin,
  // lekin kerak bo'lmasa shunchaki tokenni o'chirib yuborsak ham bo'ladi.
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

// HTML onclick="logout()" ishlashi uchun
window.logout = logout;

// ----------- BADGE FUNKSIYALAR -----------

function doorBadge(val) {
  return val === "0"
    ? `<span class="badge bg-success"><i class="fa-solid fa-door-closed"></i> Yopiq</span>`
    : `<span class="badge bg-danger"><i class="fa-solid fa-door-open"></i> Ochiq</span>`;
}

function movementBadge(val) {
  if (val === "0" || val === "1") {
    return val === "1"
      ? `<span class="badge bg-danger"><i class="fa-solid fa-person-walking"></i> Harakat bor</span>`
      : `<span class="badge bg-success"><i class="fa-solid fa-person-walking"></i> Harakat yo'q</span>`;
  }
  return `<span class="badge bg-secondary"><i class="fa-solid fa-person-walking"></i> Datchik yo'q</span>`;
}

function fireBadge(val) {
  if (val === "0" || val === "1") {
    return val === "0"
      ? `<span class="badge bg-danger"><i class="fa-solid fa-fire"></i> Yong‘in bor</span>`
      : `<span class="badge bg-success"><i class="fa-solid fa-fire"></i> Yong‘in yo‘q</span>`;
  }
  return `<span class="badge bg-secondary"><i class="fa-solid fa-fire"></i> Datchik yo'q</span>`;
}

function alarmBadge(val) {
  if (val === "0" || val === "1") {
    return val === "1"
      ? `<span class="badge bg-success"><i class="fa-solid fa-bell-slash"></i> Signal yo‘q</span>`
      : `<span class="badge bg-danger"><i class="fa-solid fa-bell"></i> Signal ochiq</span>`;
  }
  return `<span class="badge bg-secondary"><i class="fa-solid fa-bell"></i> Datchik yo'q</span>`;
}

function humidityBadge(val) {
  if (val === "Error") {
    return `<span class="badge bg-secondary"> Datchik yo'q</span>`;
  }
  return val + " %";
}

// ----------- SIGNAL (ALARM) -----------

async function setAlarm(ip, action) {
  try {
    const res = await authFetch(`${API_BASE}/alarm/${action}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ip }),
    });
    if (!res) return; // 401/403 bo'lgan bo'lsa

    const data = await res.json();
    alert(data.message);
    loadData();
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

window.setAlarm = setAlarm; // inline onclick ishlashi uchun

// ----------- DASHBOARD KARTOCHKALAR -----------

function renderDeviceCards(devices) {
  const container = document.querySelector("#deviceCards");
  if (!container) return;

  container.innerHTML = devices
    .map(
      (dev) => `
    <div class="col-md-4">
      <div class="device-card">
        <h5>${dev.region}(${dev.name})</h5>
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
            ${humidityBadge(dev.sensors.humidity)}
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
    </div>`
    )
    .join("");
}

// ----------- DEVICES TABLE -----------
function renderTable(devices) {
  const tbody = document.querySelector("#sensorTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  devices.forEach((dev) => {
    tbody.innerHTML += `
      <tr>
        <td>${dev.region}(${dev.name})</td>
        <td>${dev.ip}</td>
        <td>${dev.sensors.temperature}</td>
        <td>${humidityBadge(dev.sensors.humidity)}</td>
        <td>${doorBadge(dev.sensors.door)}</td>
        <td>${movementBadge(dev.sensors.movement)}</td>
        <td>${fireBadge(dev.sensors.fire)}</td>
        <td>
          ${alarmBadge(dev.sensors.alarm)}
          <div class="mt-1">
            <button class="btn btn-sm btn-outline-success me-1"
              onclick="setAlarm('${dev.ip}','on')">Yoqish</button>
            <button class="btn btn-sm btn-outline-danger"
              onclick="setAlarm('${dev.ip}','off')">O‘chirish</button>
          </div>
        </td>
        <td class="text-center">
          <button class="ac-btn" onclick="openAcModal('${dev.acIP}')">
            <i class="bi bi-file-spreadsheet"></i>
          </button>
        </td>
        <td class="text-center">
          <button
            class="btn btn-sm btn-outline-primary"
            onclick="openHistoryPage('${dev.id}')">
            detail
          </button>
        </td>
      </tr>`;
  });
}

function openHistoryPage(deviceId) {
  // query string orqali yuboramiz
  window.location.href = `history.html?deviceId=${deviceId}`;
}

window.openHistoryPage = openHistoryPage;

function openAcModal(ip) {
  currentACIp = ip;
  const acModal = new bootstrap.Modal(document.getElementById("acModal"));
  acModal.show();
}
window.openAcModal = openAcModal;

async function sendACCommand(cmd) {
  try {
    const res = await authFetch(`${API_BASE}/pulut/${cmd}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ip: currentACIp, command: cmd }),
    });
    if (!res) return;

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}
window.sendACCommand = sendACCommand;
// 🔔 DASHBOARD TOAST (yuqoridan chiqadi)
function showDoorToast(deviceName) {
  const toast = document.getElementById("doorToast");
  if (!toast) return;

  toast.innerHTML = `🚪 <strong>${deviceName}</strong> xonasida eshik ochildi`;
  toast.classList.remove("d-none");

  // 3 sekunddan keyin yopiladi
  setTimeout(() => {
    toast.classList.add("d-none");
  }, 3000);
}

// 🔐 Eshikning oldingi holatlari
let lastDoorState = {};
let doorCooldown = {};

// 🚨 Eshik ochilganda signal chalinishi
function checkDoorAlert(devices) {
  const audio = document.getElementById("doorAlertSound");
  if (!audio) return;

  devices.forEach((dev) => {
    const devId = dev.ip; // device identifikatori sifatida IP
    const current = Number(dev.sensors.door); // 0 yoki 1
    const previous = lastDoorState[devId];

    // birinchi kelganda faqat state saqlanadi
    if (previous === undefined) {
      lastDoorState[devId] = current;
      return;
    }

    // faqat 0 → 1 ga o'tishda signal chalsin
    if (previous === 0 && current === 1) {
      // Cooldown bo‘lsa chalmaydi
      if (doorCooldown[devId]) return;

      // 🔊 Ovoz chalish
      audio.currentTime = 0;
      audio.play().catch(() => {});
      // 🔊 2 soniya o‘tgach ovozni to‘xtatish
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 2000); // 2000ms = 2 sekund

      // 🔔 DESKTOP NOTIFICATION
      showDoorToast(dev.name);
      // 3 sekund bloklash
      doorCooldown[devId] = true;
      setTimeout(() => {
        doorCooldown[devId] = false;
      }, 3000);
    }

    // oxirgi holatni saqlaymiz
    lastDoorState[devId] = current;
  });
}
// ----------- LOAD FUNKSIYALAR -----------

async function loadDevices(regionId = "") {
  let url = `${API_BASE}/data`; // ✅ TO‘G‘RI

  if (regionId) {
    url += `?region=${regionId}`;
  }

  const res = await authFetch(url, {
    headers: buildHeaders(),
  });
  if (!res) return;

  const devices = await res.json();

  if (isDashboardPage) {
    renderDeviceCards(devices);
    checkDoorAlert(devices);
  }
}

async function loadData(regionId = "") {
  let url = `${API_BASE}/data`; // ✅ TO‘G‘RI

  if (regionId) {
    url += `?region=${regionId}`;
  }
  if (!isDevicesPage) return;
  try {
    const res = await authFetch(url, {
      headers: buildHeaders(),
    });
    if (!res) return;

    const devices = await res.json();
    renderTable(devices);
  } catch (err) {
    console.error("Device ma'lumotlarini olishda xato:", err);
  }
}

// ----------- DEVICE QO‘SHISH -----------

const addDeviceForm = document.getElementById("addDeviceForm");
const addDeviceModal = document.getElementById("addDeviceModal");

if (addDeviceModal) {
  addDeviceModal.addEventListener("show.bs.modal", () => {
    loadRegions();
  });
}

if (addDeviceForm) {
  addDeviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await authFetch(`${API_BASE}/addNetPing`, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });
      if (!res) return;

      const data = await res.json();
      if (!res.ok) return alert("Xatolik: " + (data.message || res.status));
      alert("Device qo‘shildi!");
      loadData();
      loadDevices();
      (
        bootstrap.Modal.getInstance(
          document.getElementById("addDeviceModal")
        ) ||
        bootstrap.Modal.getOrCreateInstance(
          document.getElementById("addDeviceModal")
        )
      ).hide();
      e.target.reset();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  });
}

async function loadRegions() {
  const regionSelect = document.getElementById("regionSelect"); // modal
  const regionFilter = document.getElementById("regionFilter"); // dashboard
  if (!regionSelect && !regionFilter) return;

  try {
    const res = await authFetch(`${API_BASE}/regionList`, {
      headers: buildHeaders(),
    });
    if (!res) return;

    const regions = await res.json();
    const options = regions
      .map((r) => `<option value="${r._id}">${r.region}</option>`)
      .join("");

    if (regionSelect) {
      regionSelect.innerHTML =
        `<option value="">Region tanlang...</option>` + options;
    }

    if (regionFilter) {
      regionFilter.innerHTML = `<option value="">All</option>` + options;
    }
  } catch (err) {
    console.error("Regionlarni olishda xato:", err);
  }
}

document.getElementById("regionFilter")?.addEventListener("change", (e) => {
  const regionId = e.target.value;
  loadDevices(regionId);
  loadData(regionId);
});

// ----------- USERS -----------

function renderUserTable(users) {
  const tbody = document.querySelector("#userTable tbody");
  if (!tbody) return;
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
  if (!isUsersPage) return;
  try {
    const res = await authFetch(`${API_BASE}/users`, {
      headers: buildHeaders(),
    });
    if (!res) return;

    const users = await res.json();
    renderUserTable(users);
  } catch (err) {
    console.error("Userlarni olishda xato:", err);
  }
}

const addUserForm = document.getElementById("addUserForm");
if (addUserForm) {
  addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await authFetch(`${API_BASE}/addUser`, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });
      if (!res) return;

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

async function deleteUser(username) {
  if (!confirm(`${username} ni o‘chirishni xohlaysizmi?`)) return;
  try {
    const res = await authFetch(`${API_BASE}/deleteUser`, {
      method: "DELETE",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ username }),
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) return alert("Xatolik: " + (data.message || res.status));
    alert(data.message || "User o‘chirildi!");
    loadUsers();
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}
window.deleteUser = deleteUser;

// ----------- SAHIFA YUKLANGANDA -----------

document.addEventListener("DOMContentLoaded", () => {
  if (isDevicesPage) {
    loadRegions();
    loadData();
    setInterval(() => {
      const regionId = document.getElementById("regionFilter")?.value || "";
      loadDevices(regionId);
      loadData(regionId);
    }, 3000);
  }
  if (isUsersPage) {
    loadUsers();
  }
  if (isDashboardPage) {
    loadRegions();
    loadDevices();
    setInterval(() => {
      const regionId = document.getElementById("regionFilter")?.value || "";
      loadDevices(regionId);
    }, 3000);
  }
});
