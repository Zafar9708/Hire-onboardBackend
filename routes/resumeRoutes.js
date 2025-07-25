// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const path = require('path');

// // const { uploadResume, getAllResumes, getResumeById,getCandidateResume,downloadResumeById } = require('../controllers/resumeController');

// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });

// // router.post('/upload', upload.single('resume'), uploadResume);
// // router.get('/', getAllResumes);
// // router.get('/:id', getResumeById);
// // router.get('/candidates/:id/resume', getCandidateResume);
// // router.get('/:id/download', downloadResumeById);


// // module.exports = router;


// //--- for cloudinary 

// const express = require('express');
// const router = express.Router();
// const { upload, handleCloudinaryUpload } = require('../middleware/cloudinaryUploader');
// const {protect}=require('../middleware/authMiddleware')

// const {
//   uploadResume,
//   getAllResumes,
//   getCandidateResume,
//   getResumeById,
//   downloadResumeById,
//   deleteResume
// } = require('../controllers/resumeController');

// router.post('/upload', 
//     protect,
//     upload.single('resume'),
//     handleCloudinaryUpload,
//     uploadResume
//   );

// router.get('/', getAllResumes);
// router.get('/:id', getResumeById);
// router.get('/candidates/:id/resume', getCandidateResume);
// router.get('/:id/download', downloadResumeById);
// router.delete('/:id', deleteResume);


// module.exports = router;

//-------

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const uploadFile=require('../middleware/cloudinaryUploader')
const { protect } = require('../middleware/authMiddleware');

router.post('/upload',protect, async (req, res) => {
  try {
    await uploadFile(req, res);
    return resumeController.uploadResume(req, res);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload failed'
    });
  }
});
router.get('/',  resumeController.getAllResumes);
router.get('/:id',  resumeController.getResumeById);
router.get('/candidates/:id/resume',  resumeController.getCandidateResume);
router.get('/download/:id', resumeController.downloadResumeById);
router.delete('/:id', resumeController.deleteResume);
router.get('/preview/:id', resumeController.previewResumeById);




module.exports = router;