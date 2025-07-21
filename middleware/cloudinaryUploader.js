const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`Invalid file type. Only ${filetypes} are allowed`));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
}).single('resume'); 

const uploadFile = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        reject(err);
      } else if (!req.file) {
        console.error('No file received');
        reject(new Error('No file uploaded'));
      } else {
        console.log('File received:', {
          originalname: req.file.originalname,
          size: req.file.size,
          buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'NULL'
        });
        resolve();
      }
    });
  });
};

module.exports = uploadFile;