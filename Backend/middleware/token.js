// Backend/middleware/token.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Authorization: Bearer xxxxx
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token topilmadi" });
  }
  jwt.verify(token, process.env.JWT_SECRET || "netping_secret", (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token noto'g'ri yoki muddati tugagan" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
