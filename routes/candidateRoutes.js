


// // const express = require('express');
// // const mongoose = require('mongoose');
// // const router = express.Router();
// // const upload = require('../middleware/upload');
// // const Candidate = require('../models/Candidate');
// // const { protect } = require('../middleware/authMiddleware');
// // const transporter = require('../config/email');
// // const { candidateforParticularJob, createCandidate, getAllCandidates, getCandidateById, editCandidateById, deletCandidateById, sendBulEmailToCandidate } = require('../controllers/candidateController');


// // router.post(
// //   '/',
// //   protect,
// //   upload.fields([
// //     { name: 'resume', maxCount: 1 },
// //     { name: 'additionalDocuments', maxCount: 5 }
// //   ]),
// //   createCandidate
// // );

// // router.get('/', protect, getAllCandidates);

// // router.get('/:id', protect, getCandidateById);

// // router.put(
// //   '/:id',
// //   protect,
// //   upload.fields([
// //     { name: 'resume', maxCount: 1 },
// //     { name: 'additionalDocuments', maxCount: 5 }
// //   ]),
// //   editCandidateById
// // );

// // router.delete('/:id', protect, deletCandidateById);

// // router.post('/send-bulk-emails', sendBulEmailToCandidate);

// // router.get('/getCandidateByJobs/:jobId', protect, candidateforParticularJob)



// // module.exports = router;


// //-----------

// // routes/candidateRoutes.js
// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload');
// const { protect } = require('../middleware/authMiddleware');
// const { 
//   candidateforParticularJob, 
//   createCandidate, 
//   getAllCandidates, 
//   getCandidateById, 
//   editCandidateById, 
//   deletCandidateById, 
//   sendBulEmailToCandidate ,
//   downloadResume,
//   previewResume
// } = require('../controllers/candidateController');
// const { moveCandidateStage } = require('../controllers/stageController');

// router.post(
//   '/',
//   protect,
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'additionalDocuments', maxCount: 5 }
//   ]),
//   createCandidate
// );

// router.get('/', protect, getAllCandidates);

// router.get('/:id', protect, getCandidateById);

// router.put(
//   '/:id',
//   protect,
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'additionalDocuments', maxCount: 5 }
//   ]),
//   editCandidateById
// );

// // Add the new endpoint for moving stages
// router.put('/:id/stage',  moveCandidateStage);

// router.delete('/:id', protect, deletCandidateById);



// router.post('/send-bulk-emails', protect, sendBulEmailToCandidate);

// router.get('/getCandidateByJobs/:jobId', protect, candidateforParticularJob);

// // Resume endpoints
// router.get('/:id/resume/download', downloadResume);
// router.get('/:id/resume/preview', protect, previewResume);



// module.exports = router;

//----new fix for the resume 




// const express = require('express');
// const mongoose = require('mongoose');
// const router = express.Router();
// const upload = require('../middleware/upload');
// const Candidate = require('../models/Candidate');
// const { protect } = require('../middleware/authMiddleware');
// const transporter = require('../config/email');
// const { candidateforParticularJob, createCandidate, getAllCandidates, getCandidateById, editCandidateById, deletCandidateById, sendBulEmailToCandidate } = require('../controllers/candidateController');


// router.post(
//   '/',
//   protect,
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'additionalDocuments', maxCount: 5 }
//   ]),
//   createCandidate
// );

// router.get('/', protect, getAllCandidates);

// router.get('/:id', protect, getCandidateById);

// router.put(
//   '/:id',
//   protect,
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'additionalDocuments', maxCount: 5 }
//   ]),
//   editCandidateById
// );

// router.delete('/:id', protect, deletCandidateById);

// router.post('/send-bulk-emails', sendBulEmailToCandidate);

// router.get('/getCandidateByJobs/:jobId', protect, candidateforParticularJob)



// module.exports = router;


//-----------

// routes/candidateRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { 
  candidateforParticularJob, 
  createCandidate, 
  getAllCandidates, 
  getCandidateById, 
  editCandidateById, 
  deletCandidateById, 
  sendBulEmailToCandidate ,
  downloadResume,
  previewResume
} = require('../controllers/candidateController');
const uploadMiddleware = require('../middleware/upload');

const { moveCandidateStage } = require('../controllers/stageController');


router.post('/', uploadMiddleware, createCandidate);


// Update candidate with optional file uploads
router.put('/:id', uploadMiddleware,editCandidateById
);

router.get('/',  getAllCandidates);

router.get('/:id',  getCandidateById);

router.put(
  '/:id',uploadMiddleware,editCandidateById);

// Add the new endpoint for moving stages
router.put('/:id/stage',  moveCandidateStage);

router.delete('/:id',  deletCandidateById);



router.post('/send-bulk-emails',  sendBulEmailToCandidate);

router.get('/getCandidateByJobs/:jobId', candidateforParticularJob);

// Resume endpoints
router.get('/:id/resume/download', downloadResume);
router.get('/:id/resume/preview', previewResume);



module.exports = router;