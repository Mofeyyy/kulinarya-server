export const getSpecificUserData = async (req, res) => {
  res.status(200).json({ mssg: "Get Specific User Data Route" });
};

export const updateUserData = async (req, res) => {
  res.status(200).json({ mssg: "Update User's Profile Route Route" });
};

export const softDeleteUserAccount = async (req, res) => {
  res.status(200).json({ mssg: "Soft Delete User Account Route" });
};

export const getUserRecipes = async (req, res) => {
  res.status(200).json({ mssg: "Get Specific User's Recipe" });
};
