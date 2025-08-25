const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "bu username mavjud boshqa usernamedan foydalaning"],
    unique: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

module.exports = mongoose.model("User", userSchema);
