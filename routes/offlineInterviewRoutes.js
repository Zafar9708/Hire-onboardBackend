const express = require('express');
const router = express.Router();
const offlineInterviewController = require('../controllers/offlineInterviewController');
router.post('/', offlineInterviewController.scheduleInterview);


router.get('/get', offlineInterviewController.getScheduledInterviews);

router.get('/locations', offlineInterviewController.getLocations);

router.get('/rounds', offlineInterviewController.getRounds);

module.exports = router;