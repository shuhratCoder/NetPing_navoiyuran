require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const path = require("path");
const authRoutes = require("./routes/auth");
const netPing = require("./routes/netping");
const user = require("./routes/user");

const app = express();

app.use(cors({ origin: ["https:netping.navoiyuran.uz"] }));
app.use(express.json());

// MongoDB ulash
connectDB();

// Frontend papkasini static qilish
app.use(express.static(path.join(__dirname, "../Frontend")));

// Routerlar
app.use("/", authRoutes);
app.use("/netping", netPing);
app.use("/netping", user);

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server http://192.168.11.11:${PORT} da ishga tushdi`)
);
