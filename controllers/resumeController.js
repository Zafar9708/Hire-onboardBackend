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

exports.getResumeById = async (req, res) => {
  try {
    const resume = await ResumeModel.model.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
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
