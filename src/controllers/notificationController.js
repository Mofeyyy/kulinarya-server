const getUserNotifications = async (req, res) => {
  res
    .status(200)
    .json({ mssg: "Fetch All Notifications Of An Specific User Route" });
};

const readSpecificNotification = async (req, res) => {
  res.status(200).json({ mssg: "Read Specific Notification Route" });
};

const readAllNotifications = async (req, res) => {
  res.status(200).json({ mssg: "Read All Notification Route" });
};

const softDeleteNotification = async (req, res) => {
  res.status(200).json({ mssg: "Soft Delete Notification Route" });
};

module.exports = {
  getUserNotifications,
  readSpecificNotification,
  readAllNotifications,
  softDeleteNotification,
};
