const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadResume, getAllResumes, getResumeById } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getAllResumes);
router.get('/:id', getResumeById);

module.exports = router;
