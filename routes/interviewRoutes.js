


const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const interviewerController = require('../controllers/interviewerController');
const emailTemplateController = require('../controllers/emailTemplateController');


router.post('/interviews/schedule', interviewController.scheduleInterview);
router.get('/interviews/timezones', interviewController.getTimezones);
router.get('/interviews/durations', interviewController.getDurations);


router.get('/interviews/schedule', interviewController.getAllInterviews);

router.get('/interviews/sschedule/:id', interviewController.getInterviewById);

router.get('/interviews/upcoming', interviewController.getUpcomingInterviews);

router.post('/interviewers', interviewerController.createInterviewer);
router.get('/interviewers', interviewerController.getAllInterviewers);

router.post('/email-templates', emailTemplateController.createTemplate);
router.get('/email-templates', emailTemplateController.getAllTemplates);



module.exports = router;