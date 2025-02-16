export const moderatePost = async (req, res) => {
  res.status(200).json({ message: "Moderate Post Route" });
};

export const getModerationHistory = async (req, res) => {
  res.status(200).json({ message: "Get Moderation History Route" });
};

export const updateModeration = async (req, res) => {
  res.status(200).json({ message: "Update Moderation Route" });
};

export const softDeleteModeration = async (req, res) => {
  res.status(200).json({ message: "Delete Moderation Route" });
};
