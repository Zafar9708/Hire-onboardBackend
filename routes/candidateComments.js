const express = require('express');
const router = express.Router();
const { getCandidateComments } = require('../controllers/commentHistoryController');

router.get('/:candidateId', getCandidateComments);

module.exports = router;
