const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed for thumbnail"), false);
    }
    if (file.fieldname === "pdf" && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed for document"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
