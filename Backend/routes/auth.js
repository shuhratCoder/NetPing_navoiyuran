const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const path = require("path");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

// 📌 LOGIN

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/login.html"));
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username va parol kiriting" });

  const user = await User.findOne({ username });
  if (!user)
    return res.status(401).json({ message: "Foydalanuvchi topilmadi" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Parol noto‘g‘ri" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  // Agar admin bo‘lsa — admin.html ni ochamiz
  res.json({
    token,
    role: user.role,
  });
});

// Backend/routes/auth.js yoki app.js ichida
router.post("/logout", (req, res) => {
  res.json({ message: "Logout muvaffaqiyatli bajarildi" });
});


module.exports = router;
