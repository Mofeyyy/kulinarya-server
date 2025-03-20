import multer from "multer";
import CustomError from "../utils/customError.js";

const storage = multer.memoryStorage(); // Store files in memory buffer

const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png"];
  const allowedVideos = ["video/mp4"];

  if (allowedImages.includes(file.mimetype)) {
    cb(null, true); // Accept image
  } else if (allowedVideos.includes(file.mimetype)) {
    cb(null, true); // Accept video
  } else {
    cb(
      new CustomError(
        "Invalid file type. Only JPEG, PNG, and MP4 allowed.",
        400
      ),
      false
    );
  }
};

export const fileUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (it applies to both images and videos)
  },
  fileFilter,
});
