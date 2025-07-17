const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes', // Folder name in Cloudinary
    resource_type: 'auto', // Allows PDF, DOC, DOCX, etc.
    allowed_formats: ['pdf', 'doc', 'docx']
  },
});

const upload = multer({ storage });

module.exports = upload;
