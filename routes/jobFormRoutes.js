

const express = require('express');
const router = express.Router();
const JobForm = require('../models/jobForm');
const jobTypes = require('../utils/jobTypes');
const locations = require('../utils/location');
const currencies = require('../utils/currencies');

router.get('/options', (req, res) => {
  res.json({
    jobTypes,
    locations,
    currencies
  });
});

router.get('/jobs', async (req, res) => {
  try {
    const jobForms = await JobForm.find();
    res.status(200).json({ message: 'Fetched all job forms successfully', jobForms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job forms', error: err });
  }
});

router.get('/jobforms/:id', async (req, res) => {
  try {
    const jobForm = await JobForm.findById(req.params.id);
    if (!jobForm) {
      return res.status(404).json({ message: 'Job form not found' });
    }
    res.status(200).json({ message: 'Fetched job form successfully', jobForm });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job form', error: err.message });
  }
});

module.exports = router;
