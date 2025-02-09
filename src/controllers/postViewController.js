const trackPostView = async (req, res) => {
    res.status(200).json({ message: "Track Post View Route" });
  };
  
  const getPostViews = async (req, res) => {
    res.status(200).json({ message: "Get Post Views Route" });
  };
  
  const getTopViewedPosts = async (req, res) => {
    res.status(200).json({ message: "Get Top Viewed Posts Route" });
};
  

module.exports = {
    trackPostView,
    getPostViews,
    getTopViewedPosts
}