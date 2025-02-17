export const createAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Create Announcement Route" });
};

export const getAnnouncements = async (req, res) => {
  res.status(200).json({ message: "Get Announcements Route" });
};

export const getAllActiveAnnouncements = async (req, res) => {
  res.status(200).json({ message: "Get All Active Announcements Route" });
};

export const updateAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Update Announcement Route" });
};

export const softDeleteAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Delete Announcement Route" });
};