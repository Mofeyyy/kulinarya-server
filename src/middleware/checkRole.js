export const checkRole = (allowedRoles) => async (req, res, next) => {
  console.log(req.user); // Log the user object

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized. Access restricted to specific roles." });
  }
  next();
};

export default checkRole