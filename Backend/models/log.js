const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  device: String,
  type: String,       // "door"
  value: String,      // "open"
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
