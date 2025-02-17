export const trackVisit = async (req, res) => {
  res.status(200).json({ message: "Track Platform Visit Route" });
};

export const getPlatformVisits = async (req, res) => {
  res.status(200).json({ message: "Get Platform Visits Route" });
};
