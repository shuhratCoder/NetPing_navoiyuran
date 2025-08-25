const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB ulandi");
  } catch (err) {
    console.error("❌ MongoDB ulanishida xatolik:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
