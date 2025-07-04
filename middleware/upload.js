const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeFilename = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});



const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.UPLOAD_LIMIT || '5mb' },
  fileFilter
});

module.exports = upload;