const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpe?g|png?)$/)) {
      cb(new Error("File must be a jpg, jpeg or png image"));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
