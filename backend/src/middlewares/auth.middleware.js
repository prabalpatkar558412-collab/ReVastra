const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured in backend/.env");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

function authMiddleware(req, _res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      const error = new Error("Authorization token is required");
      error.statusCode = 401;
      throw error;
    }

    const token = authorization.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, getJwtSecret());

    req.user = decoded;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      const error = new Error("You are not authorized to access this resource");
      error.statusCode = 403;
      next(error);
      return;
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};
