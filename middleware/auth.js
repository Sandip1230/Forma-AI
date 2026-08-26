const jwt = require("jsonwebtoken");

const TOKEN_COOKIE = "forma_token";

function requireAuth(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Please log in." });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Session expired or invalid — please log in again." });
  }
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, TOKEN_COOKIE };
