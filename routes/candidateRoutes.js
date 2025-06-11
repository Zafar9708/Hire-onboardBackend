


const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const upload = require('../middleware/upload');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/authMiddleware');
const transporter = require('../config/email');
const { candidateforParticularJob, createCandidate, getAllCandidates, getCandidateById, editCandidateById, deletCandidateById, sendBulEmailToCandidate } = require('../controllers/candidateController');


router.post(
  '/',
  protect,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  createCandidate
);

router.get('/', protect, getAllCandidates);

router.get('/:id', protect, getCandidateById);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  editCandidateById
);

router.delete('/:id', protect, deletCandidateById);

router.post('/send-bulk-emails', sendBulEmailToCandidate);

router.get('/getCandidateByJobs/:jobId', protect, candidateforParticularJob)



module.exports = router;


