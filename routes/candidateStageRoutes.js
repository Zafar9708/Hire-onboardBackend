
const express = require('express');
const router = express.Router();
const candidateStageController = require('../controllers/candidateStageController');

router.get('/:id', candidateStageController.getCandidate);
router.put('/:id/move', candidateStageController.moveCandidate);
router.get('/all',candidateStageController.getAllCandidateStatus)
router.get("/by-job/:jobId", candidateStageController.getStageByJobId);



module.exports = router;
