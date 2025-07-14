const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const {protect} = require('../middleware/authMiddleware');

router.post('/:interviewId/:interviewerId',  feedbackController.submitFeedback);
router.get('/:interviewId',  feedbackController.getInterviewFeedback);
router.get('/candidate/:candidateId', feedbackController.getFeedbackByCandidate);

module.exports = router;