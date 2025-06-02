const express = require('express');
const router = express.Router();
const JobStatus = require('../models/JobStatus');
const Job = require('../models/Job');

router.post('/', async (req, res) => {
  try {
    const { jobId, status, changedBy, notes } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobStatus = new JobStatus({
      jobId,
      status,
      changedBy,
      notes
    });

    const savedStatus = await jobStatus.save();
    res.status(201).json(savedStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:jobId', async (req, res) => {
  try {
    const jobStatus = await JobStatus.findOne({ jobId: req.params.jobId });
    if (!jobStatus) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(jobStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:jobId', async (req, res) => {
  try {
    const { status, changedBy, notes } = req.body;

    const updatedStatus = await JobStatus.findOneAndUpdate(
        { jobId: req.params.jobId },
        { 
          status,
          changedBy,
          notes,
          $push: { history: { status, changedBy, notes } }
        },
        { new: true, upsert: true }
      );
      
      await Job.findByIdAndUpdate(req.params.jobId, { status });
      
      res.json(updatedStatus);
      
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;