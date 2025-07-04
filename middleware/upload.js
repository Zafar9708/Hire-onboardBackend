// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadDir = 'uploads';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const safeFilename = file.originalname.replace(/\s+/g, '_');
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });



// const fileFilter = (req, file, cb) => {
//   const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   }
//   cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: process.env.UPLOAD_LIMIT || '5mb' },
//   fileFilter
// });

// module.exports = upload;

// ---new for the resume fix

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeFilename = file.originalname
      .replace(ext, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    cb(null, `${safeFilename}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.UPLOAD_LIMIT || 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

module.exports = {
  upload,
  uploadDir // Export upload directory for file operations
};