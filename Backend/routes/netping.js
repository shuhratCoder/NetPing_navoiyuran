// routes/getNetPingData.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Device = require("../models/netping"); // Qurilma modeli
const authenticateToken = require("../middleware/token");
const role = require("../middleware/role");
const Log = require("../models/log");
const Region = require("../models/region");
const mongoose = require("mongoose");

router.get("/list", authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: "Server xatosi" });
  }
});
// Qurilma qo‘shish
router.post(
  "/addNetPing",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const device = new Device(req.body);
      await device.save();

      res.status(201).json({
        message: "Qurilma muvaffaqiyatli qo‘shildi",
        device,
      });
    } catch (error) {
      res.status(400).json({
        message: "Xatolik yuz berdi",
        error: error.message,
      });
    }
  }
);

// Temperature parse
function parseTemperature(data) {
  if (typeof data !== "string") return "Error";
  const match = data.match(/thermo_result\('ok',\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `${match[1]}`;
  }
  return "Error";
}

// Humidity parse
function parseHumidity(data) {
  if (typeof data !== "string") return "Error";
  const match = data.match(/relhum_result\('ok',\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `${match[1]}`;
  }
  return "Error";
}
// IO parse
function parseIO(data) {
  if (typeof data !== "string") return "Error";
  const match = data.match(/io_result\('ok',\s*-?\d+,\s*(\d+),\s*\d+\)/);
  if (match) {
    return match[1]; // faqat uchinchi qiymat
  }
  return "Error";
}

// Qurilmalardan ma'lumot olish
router.get("/data", authenticateToken, role(["admin"]), async (req, res) => {
   const { region } = req.query;
  let filter = {};
  if (region) {
    filter.regionID = region;
  }
  try {
    const devices = await Device.find(filter);
    const results = [];

    for (const dev of devices) {
      const region = await Region.findById(dev.regionID);
      const deviceData = {
        id:dev._id,
        region: region.region,
        name: dev.name,
        ip: dev.ipAddress,
        acIP: dev.acIP,
        sensors: {
          temperature: "Error",
          humidity: "Error",
          door: "Error",
          movement: "Error",
          fire: "Error",
          alarm: "Error",
        },
      };

      // Temperature
      try {
        const tempRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/thermo.cgi?t${dev.temperaturePort}`,
          { timeout: 3000 }
        );

        deviceData.sensors.temperature = parseTemperature(tempRes.data);
      } catch (e) {
        console.error("temp", e.message);
        deviceData.sensors.temperature = "Error";
      }

      // Humidity
      try {
        const humRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/relhum.cgi?h${dev.humidityPort}`,
          { timeout: 3000 }
        );
        deviceData.sensors.humidity = parseHumidity(humRes.data);
      } catch (e) {
        console.error("humidity", e.message);
        deviceData.sensors.humidity = "Error";
      }

      // Door
      try {
        const doorRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/io.cgi?io${dev.doorIO}`,
          { timeout: 3000 }
        );
        deviceData.sensors.door = parseIO(doorRes.data);
      } catch (e) {
        console.error("door", e.message);
        deviceData.sensors.door = "Error";
      }

      // Movement
      try {
        const movRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/io.cgi?io${dev.movementIO}`,
          { timeout: 3000 }
        );
        deviceData.sensors.movement = parseIO(movRes.data);
      } catch (e) {
        console.error("movement", e.message);
        deviceData.sensors.movement = "Error";
      }
      // Fire IO
      try {
        const fireRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/io.cgi?io${dev.fireIO}`,
          { timeout: 3000 }
        );
        deviceData.sensors.fire = parseIO(fireRes.data);
      } catch (e) {
        console.error("fire", e.message);
        deviceData.sensors.fire = "Error";
      }

      // Alarm IO
      try {
        const alarmRes = await axios.get(
          `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/io.cgi?io${dev.alarmIO}`,
          { timeout: 3000 }
        );
        deviceData.sensors.alarm = parseIO(alarmRes.data);
      } catch (e) {
        console.error("alarm", e.message);
        deviceData.sensors.alarm = "Error";
      }

      results.push(deviceData);
    }

    res.json(results);
  } catch (error) {
    console.error("NetPing ma'lumotlarini olishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});
// Signalizatsiyani o'chirish
router.post(
  "/alarm/off",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      let deviceIp = req.body.ip;
      const device = await Device.findOne({ ipAddress: deviceIp });

      await axios.get(
        `http://${device.username}:${device.password}@${device.ipAddress}:${device.httpPort}/io.cgi?io4=1`
      );
      res.json({ success: true, message: "Signalizatsiya o‘chirildi" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

// Signalizatsiyani yoqish
router.post(
  "/alarm/on",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      let deviceIp = req.body.ip;
      const device = await Device.findOne({ ipAddress: deviceIp });
      await axios.get(
        `http://${device.username}:${device.password}@${device.ipAddress}:${device.httpPort}/io.cgi?io4=0`
      );
      res.json({ success: true, message: "Signalizatsiya yoqildi" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/off",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=5`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/on",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=6`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/17",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=4`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/20",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=3`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/22",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=1`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

router.post(
  "/pulut/fan",
  authenticateToken,
  role(["admin"]),
  async (req, res) => {
    try {
      const command = req.body.command;
      const acIP = req.body.ip;
      const device = await Device.findOne({ acIP: acIP });
      await axios.get(
        `http://${device.username}:${device.password}@${device.acIP}:${device.httpPort}/ir.cgi?play=2`
      );
      res.json({ success: true, message: `Pulut ${command} yuborildi` });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Xatolik", error: err.message });
    }
  }
);

async function saveLog() {
  try {
    const devices = await Device.find();
    for (const dev of devices) {
      const tempRes = await axios.get(
        `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/thermo.cgi?t${dev.temperaturePort}`,
        { timeout: 3000 }
      );
      const doorRes = await axios.get(
        `http://${dev.username}:${dev.password}@${dev.ipAddress}:${dev.httpPort}/io.cgi?io${dev.doorIO}`,
        { timeout: 3000 }
      );
      const temp = Number(parseTemperature(tempRes.data));
      const door = Number(parseIO(doorRes.data));
      const log = new Log({
        deviceId: dev._id, // MUHIM
        temp,
        door,
      });
      await log.save();
    }
  } catch (err) {
    console.error(err.message);
  }
}
setInterval(saveLog, 5 * 60 * 100);

router.get("/history/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid deviceId" });
    }

    const logs = await Log.find({
      deviceId: id,
      createdAt: {
        $gte: new Date(Number(from)),
        $lte: new Date(Number(to))
      }
    }).sort({ createdAt: 1 });

    const temperature = logs.map((l) => ({
      time: l.createdAt,
      value: l.temp
    }));

    const door = logs.map((l) => ({
      time: l.createdAt,
      value: l.door
    }));

    res.json({ temperature, door });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xatosi" });
  }
});
router.get("/regionList", async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
