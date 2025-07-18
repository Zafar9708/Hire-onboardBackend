// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;

// // Configure memory storage
// const storage = multer.memoryStorage();

// // File filter configuration
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];
  
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only PDF and Word documents are allowed'), false);
//   }
// };

// // Create multer instance
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB
//   }
// });

// // Middleware to handle Cloudinary upload
// const handleCloudinaryUpload = async (req, res, next) => {
//   if (!req.file) return next();
  
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: 'resumes',
//           resource_type: 'auto',
//           format: 'pdf' // Convert all files to PDF for consistency
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );
      
//       uploadStream.end(req.file.buffer);
//     });

//     req.file.cloudinary = {
//       url: result.secure_url,
//       public_id: result.public_id
//     };
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   upload,
//   handleCloudinaryUpload
// };


//------

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure memory storage
const storage = multer.memoryStorage();

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;