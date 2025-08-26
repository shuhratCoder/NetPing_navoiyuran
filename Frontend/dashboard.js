const API_BASE = "http://localhost:3001/netping";

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

function renderTable(devices) {
  const tbody = document.querySelector("#sensorTable tbody");
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
                        }', 'on')">Yoqish</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="setAlarm('${
                          dev.ip
                        }', 'off')">O‘chirish</button>
                    </div>
                </td>
                <td class="text-center">
  <button class="ac-btn" onclick="openAcModal('${dev.acIP}')">
     <i class="bi bi-file-spreadsheet"></i>
  </button>
</td>
            </tr>
        `;
  });
}

async function loadData() {
  try {
    const res = await fetch(`${API_BASE}/data`);
    const devices = await res.json();
    renderTable(devices);
  } catch (err) {
    console.error("Xatolik:", err);
  }
}

// Device qo‘shish
document
  .getElementById("addDeviceForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch(`${API_BASE}/addNetPing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Device qo‘shildi!");
      loadData();
      e.target.reset();
      bootstrap.Modal.getInstance(
        document.getElementById("addDeviceModal")
      ).hide();
    } else {
      alert("Xatolik!");
    }
  });

// User qo‘shish
document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch(`${API_BASE}/addUser`, {
    // Backend endpoint
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    alert("User qo‘shildi!");
    e.target.reset();
    bootstrap.Modal.getInstance(document.getElementById("addUserModal")).hide();
  } else {
    alert("Xatolik!");
  }
});

let currentACIp = null;

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

setInterval(loadData, 1000);
loadData();
