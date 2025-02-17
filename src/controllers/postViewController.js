export const trackPostView = async (req, res) => {
  res.status(200).json({ message: "Track Post View Route" });
};

export const getPostViews = async (req, res) => {
  res.status(200).json({ message: "Get Post Views Route" });
};

export const getTopViewedPosts = async (req, res) => {
  res.status(200).json({ message: "Get Top Viewed Posts Route" });
};