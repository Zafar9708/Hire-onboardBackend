


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

router.get('/interviews', interviewController.getAllInterviews);
router.get('/interviews/:id',  interviewController.getInterviewById);

router.post('/interviewers', interviewerController.createInterviewer);
router.get('/interviewers', interviewerController.getAllInterviewers);

router.post('/email-templates', emailTemplateController.createTemplate);
router.get('/email-templates', emailTemplateController.getAllTemplates);


router.get('/jobs/:jobId', async (req, res) => {
    try {
      const job = await job.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      res.json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });



module.exports = router;