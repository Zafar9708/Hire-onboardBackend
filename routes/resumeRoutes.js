// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');

// const { uploadResume, getAllResumes, getResumeById,getCandidateResume,downloadResumeById } = require('../controllers/resumeController');

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post('/upload', upload.single('resume'), uploadResume);
// router.get('/', getAllResumes);
// router.get('/:id', getResumeById);
// router.get('/candidates/:id/resume', getCandidateResume);
// router.get('/:id/download', downloadResumeById);


// module.exports = router;


//--- for cloudinary 

const express = require('express');
const router = express.Router();
const { upload, handleCloudinaryUpload } = require('../middleware/cloudinaryUploader');
const {protect}=require('../middleware/authMiddleware')

const {
  uploadResume,
  getAllResumes,
  getCandidateResume,
  getResumeById,
  downloadResumeById,
  deleteResume
} = require('../controllers/resumeController');

router.post('/upload', 
    protect,
    upload.single('resume'),
    handleCloudinaryUpload,
    uploadResume
  );

router.get('/', getAllResumes);
router.get('/:id', getResumeById);
router.get('/candidates/:id/resume', getCandidateResume);
router.get('/:id/download', downloadResumeById);
router.delete('/:id', deleteResume);


module.exports = router;