

const path = require('path');
const fs = require('fs');
const Candidate = require('../models/Candidate');
const ResumeModel = require('../models/resumeModel');



exports.uploadResume = async (req, res) => {
  try {
    const resume = await ResumeModel.parseAndSave(req.file);
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await ResumeModel.model.find();
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getCandidateResume = async (req, res) => {
  try {
    const resume = await ResumeModel.model.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume || !candidate.resume.url) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    return res.json({ url: candidate.resume.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume || !candidate.resume.url) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    return res.redirect(candidate.resume.url);
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ success: false, message: 'Server error while downloading resume' });
  }
};

