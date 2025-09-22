const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    window.location.href = "/login.html";
    return res.status(401).json({ message: "Token topilmadi" });
  } else {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        window.location.href = "/login.html";
        return res.status(403).json({ message: "Token noto‘g‘ri" });
      }
      req.user = user;
      next();
    });
  }
}

module.exports = authenticateToken;
