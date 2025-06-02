
const express = require('express');
const router = express.Router();
const candidateStageController = require('../controllers/candidateStageController');

router.get('/:id', candidateStageController.getCandidate);
router.put('/:id/move', candidateStageController.moveCandidate);


module.exports = router;
