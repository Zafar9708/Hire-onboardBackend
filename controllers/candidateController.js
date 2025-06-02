const Candidate = require('../models/Candidate');
const { parseResume } = require('../utils/resumeParser');

const createCandidate = async (req, res) => {
  try {
    const candidateData = req.body;
    
    if (req.files) {
      if (req.files.resume) {
        candidateData.resume = {
          path: req.files.resume[0].path,
          originalName: req.files.resume[0].originalname
        };
      }
      
      if (req.files.additionalDocuments) {
        candidateData.additionalDocuments = req.files.additionalDocuments.map(file => ({
          path: file.path,
          originalName: file.originalname
        }));
      }
    }

    if (req.files?.resume) {
      const parsedData = await parseResume(req.files.resume[0]);
      candidateData.skills = parsedData.skills ? parsedData.skills.split(',').map(s => s.trim()) : [];
      candidateData.experience = parsedData.experience || '';
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Candidate with this email already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  createCandidate
};