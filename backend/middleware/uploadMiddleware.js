const multer = require('multer');
const path = require('path');

// Set storage engine
// NOTE: Vercel's serverless environment has a read-only filesystem, except for the /tmp directory.
// We are using /tmp for uploads. This is temporary storage.
const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: function (req, file, cb) {
    // The /tmp/uploads directory may not exist, so we should ensure it's created.
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;