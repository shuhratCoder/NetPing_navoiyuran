const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Qurilma nomi majburiy"],
      trim: true,
      minlength: [3, "Qurilma nomi kamida 3 ta belgidan iborat bo‘lishi kerak"],
    },
    ipAddress: {
      type: String,
      required: [true, "IP manzili majburiy"],
      validate: {
        validator: function (v) {
          return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(
            v,
          );
        },
        message: "IP manzil noto‘g‘ri formatda",
      },
    },
    acIP: {
      type: String,
      //required: [true, "AC IP manzili majburiy"],
      // validate: {
      //   validator: function (v) {
      //     return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(
      //       v
      //     );
      //   },
      //   message: "AC IP manzil noto‘g‘ri formatda",
      // },
    },
    httpPort: {
      type: Number,
      //required: [true, "HTTP port majburiy"],
      // min: [1, "Port 1 dan kichik bo‘lishi mumkin emas"],
      // max: [65535, "Port 65535 dan katta bo‘lishi mumkin emas"],
    },
    username: {
      type: String,
      required: [true, "Username majburiy"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Parol majburiy"],
    },
    temperaturePort: {
      type: String,
      required: [true, "Temperatura porti majburiy"],
    },
    humidityPort: {
      type: String,
      //required: [true, "Namlik porti majburiy"],
    },
    alarmIO: {
      type: String,
      //required: [true, "Signalizatsiya IO majburiy"],
    },
    doorIO: {
      type: String,
      required: [true, "Eshik IO majburiy"],
    },
    fireIO: {
      type: String,
      //required: [true, "Olov IO majburiy"],
    },
    movementIO: {
      type: String,
      //required: [true, "Harakat IO majburiy"],
    },
    regionID: { type: mongoose.Schema.Types.ObjectId, required: true },
    deviceType: {
      type: String,
      required: [true, "Eshik IO majburiy"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Device", deviceSchema);
