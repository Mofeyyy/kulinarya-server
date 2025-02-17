export const getUserNotifications = async (req, res) => {
  res
    .status(200)
    .json({ mssg: "Fetch All Notifications Of An Specific User Route" });
};

export const readSpecificNotification = async (req, res) => {
  res.status(200).json({ mssg: "Read Specific Notification Route" });
};

export const readAllNotifications = async (req, res) => {
  res.status(200).json({ mssg: "Read All Notification Route" });
};

export const softDeleteNotification = async (req, res) => {
  res.status(200).json({ mssg: "Soft Delete Notification Route" });
};