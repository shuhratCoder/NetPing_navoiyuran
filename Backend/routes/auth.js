const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const path = require("path");

const router = express.Router();

// LOGIN sahifasini qaytarish
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/login.html"));
});

// LOGIN endpoint
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1) Username bo‘yicha qidirish
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Foydalanuvchi topilmadi" });
    }

    // 2) Parolni bcrypt orqali solishtirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol noto‘g‘ri" });
    }

    // 3) Token yaratish
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4) Login javobi
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

module.exports = router;
