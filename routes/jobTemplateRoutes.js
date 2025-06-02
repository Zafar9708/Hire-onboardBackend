const express = require('express');
const router = express.Router();
const jobTemplateController = require('../controllers/jobTemplateController');

router.get('/', jobTemplateController.getJobTemplates);

module.exports = router;
