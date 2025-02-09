const createAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Create Announcement Route" });
};

const getAnnouncements = async (req, res) => {
  res.status(200).json({ message: "Get Announcements Route" });
};

const getAllActiveAnnouncements = async (req, res) => {
  res.status(200).json({ message: "Get All Active Announcements Route" });
};

const updateAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Update Announcement Route" });
};

const softDeleteAnnouncement = async (req, res) => {
  res.status(200).json({ message: "Delete Announcement Route" });
};


module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAllActiveAnnouncements,
  updateAnnouncement,
  softDeleteAnnouncement
};
