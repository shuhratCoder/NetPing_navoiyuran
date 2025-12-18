const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    temp: {
      type: Number,
      required: true,
    },
    door: {
      type: Number, // 0 yoki 1
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Log", logSchema);
