


const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const upload = require('../middleware/upload');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/authMiddleware');
const transporter = require('../config/email');


router.post(
  '/',
  protect,  
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      data.resume = req.files?.resume?.[0] || null;
      data.additionalDocuments = req.files?.additionalDocuments || [];
      data.userId = req.user._id;  

      const candidate = new Candidate(data);
      await candidate.save();
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);



router.get('/', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({ userId: req.user._id });  
    
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'No candidates found for this user' });
    }

    res.json(candidates); 
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ _id: req.params.id, userId: req.user._id });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const updates = req.body;
      if (req.files?.resume?.[0]) {
        updates.resume = req.files.resume[0];
      }
      if (req.files?.additionalDocuments) {
        updates.additionalDocuments = req.files.additionalDocuments;
      }

      const candidate = await Candidate.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id }, 
        updates,
        { new: true }
      );

      if (!candidate) return res.status(404).json({ error: 'Candidate not found or not owned' });

      res.json(candidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.delete('/:id', protect, async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedCandidate) return res.status(404).json({ error: 'Candidate not found or not owned' });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/send-bulk-emails',  async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients list is required and must be an array.' });
    }

    const sendPromises = recipients.map(email => {
      return transporter.sendMail({
        from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: body
      });
    });

    await Promise.all(sendPromises);

    res.status(200).json({ message: 'Emails sent successfully.' });
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    res.status(500).json({ error: 'Failed to send emails.' });
  }
});



module.exports = router;


