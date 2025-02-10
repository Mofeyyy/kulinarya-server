const userRegistration = async (req, res) => {
  res.status(200).json({ mssg: "User Registration Route" });
};

const emailVerification = async (req, res) => {
  res.status(200).json({ mssg: "Email Verification Route" });
};

const userLogin = async (req, res) => {
  res.status(200).json({ mssg: "Login Route" });
};

const userLogout = async (req, res) => {
  res.status(200).json({ mssg: "Logout Route" });
};

const getUserDetails = async (req, res) => {
  res.status(200).json({ mssg: "Retrieve User Details Route" });
};

const forgotPassword = async (req, res) => {
  res.status(200).json({ mssg: "Forgot Password Route" });
};

const resetPassword = async (req, res) => {
  res.status(200).json({ mssg: "Reset Password Route" });
};

module.exports = {
  userRegistration,
  emailVerification,
  userLogin,
  userLogout,
  getUserDetails,
  forgotPassword,
  resetPassword,
};
