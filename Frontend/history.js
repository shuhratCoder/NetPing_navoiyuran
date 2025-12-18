//const API_BASE = "http://localhost:3001/netping";

function getToken() {
  return localStorage.getItem("token");
}
function buildHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function authFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
    return;
  }
  return res;
}

let deviceId = null;
let deviceName = "Device";
let tempChart = null;
let doorChart = null;

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function setQuickRange(hours) {
  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  document.getElementById("fromInput").value = toLocalInputValue(from);
  document.getElementById("toInput").value = toLocalInputValue(to);
}
window.setQuickRange = setQuickRange;

function buildTimeSeries(points) {
  // Chart.js time scale uchun: {x: Date, y: number}
  return points.map((p) => ({ x: new Date(p.time), y: Number(p.value) }));
}

function drawTempChart(data) {
  const ctx = document.getElementById("tempChart");

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "Temperature (°C)",
        data: data.map(d => ({
          x: new Date(d.time),
          y: Number(d.value)
        })),
        borderColor: "#ff9800",
        backgroundColor: "rgba(255,152,0,0.25)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: {
              hour: "HH:mm"
            }
          },
          ticks: {
            color: "#cbd5f5"
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        },

        y: {
          min: -10,
          max: 40,
          ticks: {
            stepSize: 5,
            color: "#e5e7eb",
            callback: v => `${v}°C`
          },
          grid: {
            color: "rgba(255,255,255,0.15)" // 🔥 ASOSIY JOY
          }
        }
      },

      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `🌡 ${ctx.parsed.y} °C`
          }
        }
      }
    }
  });
}

function drawDoor(points) {
  const ctx = document.getElementById("doorChart");
  if (doorChart) doorChart.destroy();

  doorChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "Door",
        data: points.map(p => ({
          x: new Date(p.time),
          y: Number(p.value)
        })),
        stepped: true,
        borderColor: "#38bdf8",
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: { hour: "HH:mm" }
          },
          ticks: {
            color: "#cbd5f5",
            maxTicksLimit: 12
          },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        y: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 1,
            color: "#cbd5f5",
            callback: v => v === 1 ? "Open" : "Closed"
          },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      },

      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              ctx.parsed.y === 1 ? "🚪 Open" : "🚪 Closed"
          }
        }
      }
    }
  });
}

async function loadHistory() {
  const fromVal = document.getElementById("fromInput").value;
  const toVal = document.getElementById("toInput").value;

  const from = new Date(fromVal).getTime();
  const to = new Date(toVal).getTime();

  const res = await authFetch(
    `${API_BASE}/history/${deviceId}?from=${from}&to=${to}`,
    { headers: buildHeaders() }
  );
  if (!res) return;

  const data = await res.json();

  drawTempChart(data.temperature || []);
  drawDoor(data.door || []);
}

window.loadHistory = loadHistory;

document.addEventListener("DOMContentLoaded", () => {
  deviceId = qs("deviceId");
  deviceName = qs("name") || "Device";

  if (!deviceId) {
    document.getElementById("pageTitle").innerText = "❌ deviceId topilmadi";
    return;
  }

  document.getElementById("pageTitle").innerText = `📊 ${deviceName} — History`;

  // default 48h
  setQuickRange(48);
  loadHistory();
});
