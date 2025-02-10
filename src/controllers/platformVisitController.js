const trackVisit = async (req, res) => {
  res.status(200).json({ message: "Track Platform Visit Route" });
};

const getPlatformVisits = async (req, res) => {
  res.status(200).json({ message: "Get Platform Visits Route" });
};

module.exports = {
  trackVisit,
  getPlatformVisits,
};
