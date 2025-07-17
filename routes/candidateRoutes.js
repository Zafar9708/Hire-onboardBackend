

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
  sendBulEmailToCandidate ,
  getCandidateStageHistory,
  getStageByCandidateId
  
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


router.get("/stage-history", getCandidateStageHistory);
router.get("/stage-history/:id", getStageByCandidateId);



router.get('/', protect, getAllCandidates);

router.get('/:id',  getCandidateById);


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

// Resume endpoints
// router.get('/:id/resume/download', downloadResume);
// router.get('/:id/resume/preview', protect, previewResume);



module.exports = router;