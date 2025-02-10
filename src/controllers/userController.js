const getSpecificUserData = async (req, res) => {
  res.status(200).json({ mssg: "Get Specific User Data Route" });
};

const updateUserData = async (req, res) => {
  res.status(200).json({ mssg: "Update User's Profile Route Route" });
};

const softDeleteUserAccount = async (req, res) => {
  res.status(200).json({ mssg: "Soft Delete User Account Route" });
};

const getUserRecipes = async (req, res) => {
  res.status(200).json({ mssg: "Get Specific User's Recipe" });
};

module.exports = {
  getSpecificUserData,
  updateUserData,
  softDeleteUserAccount,
  getUserRecipes,
};
