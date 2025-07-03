


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
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const { 
  candidateforParticularJob, 
  createCandidate, 
  getAllCandidates, 
  getCandidateById, 
  editCandidateById, 
  deletCandidateById, 
  sendBulEmailToCandidate 
} = require('../controllers/candidateController');
const { moveCandidateStage } = require('../controllers/stageController');

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  createCandidate
);

router.get('/', protect, getAllCandidates);

router.get('/:id', protect, getCandidateById);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  editCandidateById
);

// Add the new endpoint for moving stages
router.put('/:id/stage',  moveCandidateStage);

router.delete('/:id', protect, deletCandidateById);



router.post('/send-bulk-emails', protect, sendBulEmailToCandidate);

router.get('/getCandidateByJobs/:jobId', protect, candidateforParticularJob);

// In your candidateRoutes.js
router.get('/:id/resume', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resume?.path) {
      return res.status(404).send('Resume not found');
    }
    
    const filePath = path.join(__dirname, '..', candidate.resume.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Resume file not found');
    }

    // Set proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${candidate.firstName}_${candidate.lastName}_Resume.pdf`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



module.exports = router;