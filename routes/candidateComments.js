const express = require('express');
const router = express.Router();
const { getCandidateComments } = require('../controllers/commentHistoryController');

// GET /api/candidate-comments/:candidateId
router.get('/:candidateId', getCandidateComments);

module.exports = router;
