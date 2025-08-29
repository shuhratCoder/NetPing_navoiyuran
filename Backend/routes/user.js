const express = require("express");
const router = express.Router();
const User=require("../models/user")
const bcrypt = require("bcryptjs");


router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Foydalanuvchilarni yuklashda xato:", error);
    res.status(500).json({ message: "Ichki server xatosi" });
  }
});


router.post("/addUser", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Barcha maydonlarni to‘ldiring!" });
    }

    // Username takrorlanmasligi
    const existUser = await User.findOne({ username });
    if (existUser) {
      return res.status(400).json({ message: "Bu username band!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo‘shildi." });
  } catch (error) {
    console.error("Foydalanuvchini qo‘shishda xato:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
});

router.delete("/deleteUser", async (req, res) => {
  const { username } = req.body;
  try {
    await User.deleteOne({ username });
    res.json({ message: "Foydalanuvchi o‘chirildi." });
  } catch (error) {
    console.error("Foydalanuvchini o‘chirishda xato:", error);
    res.status(500).json({ message: "Ichki server xatosi" });
  }
});

module.exports = router;
