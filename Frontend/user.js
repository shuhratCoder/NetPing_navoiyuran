const API_BASE = 'http://localhost:3001/netping';

let tempHumidityChart;
let statusPieChart;

function renderStats(dev) {
    const statHTML = `
        <div class="col-md-2 stat-card"><h2>${dev.sensors.temperature}°C</h2><p>Harorat</p></div>
        <div class="col-md-2 stat-card"><h2>${dev.sensors.humidity}%</h2><p>Namlik</p></div>
        <div class="col-md-2 stat-card"><h2>${dev.sensors.door ? '🚪 Ochiq' : '🔒 Yopiq'}</h2><p>Eshik</p></div>
        <div class="col-md-2 stat-card"><h2>${dev.sensors.movement ? 'Bor' : 'Yo‘q'}</h2><p>Harakat</p></div>
        <div class="col-md-2 stat-card"><h2>${dev.sensors.fire ? '🔥' : '✅'}</h2><p>Olov</p></div>
        <div class="col-md-2 stat-card"><h2>${dev.sensors.alarm ? '🚨 ON' : 'OFF'}</h2><p>Signal</p></div>
    `;
    document.getElementById('statCards').innerHTML = statHTML;
}

function renderCharts(dev) {
    const ctx1 = document.getElementById('tempHumidityChart').getContext('2d');
    const ctx2 = document.getElementById('statusPie').getContext('2d');

    if (tempHumidityChart) tempHumidityChart.destroy();
    if (statusPieChart) statusPieChart.destroy();

    tempHumidityChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [new Date().toLocaleTimeString()],
            datasets: [
                { label: 'Harorat (°C)', data: [dev.sensors.temperature], borderColor: 'red', fill: false },
                { label: 'Namlik (%)', data: [dev.sensors.humidity], borderColor: 'blue', fill: false }
            ]
        },
        options: { responsive: true }
    });

    statusPieChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Eshik', 'Harakat', 'Olov'],
            datasets: [{
                data: [
                    dev.sensors.door ? 1 : 0,
                    dev.sensors.movement ? 1 : 0,
                    dev.sensors.fire ? 1 : 0
                ],
                backgroundColor: ['orange', 'yellow', 'red']
            }]
        }
    });
}

async function loadData() {
    const res = await fetch(`${API_BASE}/data`);
    const devices = await res.json();
    if (devices.length > 0) {
        renderStats(devices[0]);
        renderCharts(devices[0]);
    }
}

setInterval(loadData, 1000);
loadData();
