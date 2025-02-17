// Middleware to check user role
export const checkRole = (allowedRoles) => async (req, res, next) => {
    try {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized. Access restricted to specific roles." });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error.", error });
    }
};
  
export default checkRole;