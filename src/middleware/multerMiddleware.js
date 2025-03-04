import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory buffer

const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png"];
  const allowedVideos = ["video/mp4"];

  if (![...allowedImages, ...allowedVideos].includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only JPEG, PNG, and MP4 allowed."),
      false
    );
  }

  cb(null, true);
};

export const fileUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size
  fileFilter,
});
