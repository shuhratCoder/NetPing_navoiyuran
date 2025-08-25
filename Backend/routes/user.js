const express = require("express");
const router = express.Router();
const User=require("../models/user")
const bcrypt = require("bcryptjs");


router.post("/addUser", async (req, res) => {
  const { username, password, role } = req.body;
const bcryptPass = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({ username, password: bcryptPass, role });
    await newUser.save();
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo'shildi." });
  } catch (error) {
    console.error("Foydalanuvchini qo'shishda xato:", error);
    res.status(500).json({ message: "Ichki server xatosi" });
  }
});

module.exports = router;
