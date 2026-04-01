const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware
 * Verifies JWT token from the Authorization header.
 * Attaches decoded user payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide a Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = decoded; // { id, walletAddress, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
    });
  }
}

/**
 * Role-based Access Control Middleware
 * @param  {...string} roles - Allowed roles (e.g., "patient", "doctor", "admin")
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden. You do not have permission to access this resource.",
      });
    }
    next();
  };
}

module.exports = { authMiddleware, authorize };
