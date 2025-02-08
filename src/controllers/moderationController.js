const moderatePost = async (req, res) => {
  
  res.status(200).json({ message: "Moderate Post Route" });
};

const getModerationHistory = async (req, res) => {
  res.status(200).json({ message: "Get Moderation History Route" });
};

const updateModeration = async (req, res) => {
  res.status(200).json({ message: "Update Moderation Route" });
};

const softDeleteModeration = async (req, res) => {
  res.status(200).json({ message: "Delete Moderation Route" });
};

module.exports = {
  moderatePost,
  getModerationHistory,
  updateModeration,
  softDeleteModeration
}