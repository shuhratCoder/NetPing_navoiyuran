require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const netPing = require("./routes/netping");
const user = require("./routes/user");

const app = express();
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // true agar HTTPS ishlatilsa
//   })
// );
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
  console.log(`Server http://localhost:${PORT} da ishga tushdi`)
);
