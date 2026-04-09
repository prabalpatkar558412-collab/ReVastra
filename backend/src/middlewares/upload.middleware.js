const multer = require("multer");

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new Error(
          "Only PNG, JPEG, WEBP, HEIC, and HEIF device images are allowed"
        )
      );
      return;
    }

    callback(null, true);
  },
});

module.exports = upload;
