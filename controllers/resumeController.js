

// const path = require('path');
// const fs = require('fs');
// const Candidate = require('../models/Candidate');
// const ResumeModel = require('../models/resumeModel');



// exports.uploadResume = async (req, res) => {
//   try {
//     const resume = await ResumeModel.parseAndSave(req.file);
//     res.status(201).json(resume);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getAllResumes = async (req, res) => {
//   try {
//     const resumes = await ResumeModel.model.find();
//     res.json(resumes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// exports.getCandidateResume = async (req, res) => {
//   try {
//     const resume = await ResumeModel.model.findById(req.params.id);
//     if (!resume) return res.status(404).json({ error: 'Resume not found' });
//     res.json(resume);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume || !candidate.resume.url) {
//       return res.status(404).json({ success: false, message: 'Resume not found' });
//     }

//     return res.json({ url: candidate.resume.url });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.downloadResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume || !candidate.resume.url) {
//       return res.status(404).json({ success: false, message: 'Resume not found' });
//     }
    

//     return res.redirect(candidate.resume.url);
//   } catch (err) {
//     console.error('Download error:', err);
//     return res.status(500).json({ success: false, message: 'Server error while downloading resume' });
//   }
// };

//------for cloudinary

const Resume = require('../models/resumeModel');
const Candidate = require('../models/Candidate');
const cloudinary = require('../config/cloudinary');

exports.uploadResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: "No resume file uploaded" });

    const result = await cloudinary.uploader.upload(file.path, { resource_type: "raw" });

    const extractedText = await extractText(file.path);
    const skills = extractSkills(extractedText);
    const experience = extractExperience(extractedText);

    const newResume = new Resume({
      resumeUrl: result.secure_url,
      originalFileName: file.originalname,
      extractedSkills: skills,
      experience: experience,
    });

    let savedResume;
    try {
      savedResume = await newResume.save();
    } catch (err) {
      console.error("Error saving resume:", err);
      return res.status(500).json({ success: false, error: "Failed to save resume", message: err.message });
    }

    res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resumeId: savedResume?._id,
      resumeUrl: savedResume?.resumeUrl,
      skills,
      experience,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    res.status(500).json({ success: false, error: "Failed to upload resume", message: error.message });
  }
};


exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().populate('candidateId', 'firstName lastName email');
    res.json({
      success: true,
      count: resumes.length,
      resumes: resumes.map(resume => ({
        id: resume._id,
        url: resume.url,
        candidateId: resume.candidateId,
        candidateName: resume.candidateId 
          ? `${resume.candidateId.firstName} ${resume.candidateId.lastName}`
          : 'Unknown',
        fileType: resume.fileType,
        originalName: resume.originalName
      }))
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to fetch resumes'
    });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('candidateId', 'firstName lastName email');
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        error: 'Resume not found' 
      });
    }

    res.json({
      success: true,
      resume: {
        id: resume._id,
        url: resume.url,
        candidateId: resume.candidateId,
        candidateName: resume.candidateId 
          ? `${resume.candidateId.firstName} ${resume.candidateId.lastName}`
          : 'Unknown',
        fileType: resume.fileType,
        originalName: resume.originalName,
        createdAt: resume.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to fetch resume' 
    });
  }
};

exports.getCandidateResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('resume');
    
    if (!candidate) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidate not found' 
      });
    }

    if (!candidate.resume) {
      return res.status(404).json({ 
        success: false,
        error: 'Resume not found for this candidate' 
      });
    }

    res.json({
      success: true,
      resume: {
        id: candidate.resume._id,
        url: candidate.resume.url,
        fileType: candidate.resume.fileType,
        originalName: candidate.resume.originalName
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to fetch resume'
    });
  }
};

exports.downloadResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        error: 'Resume not found' 
      });
    }

    res.redirect(resume.url);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to download resume'
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        error: 'Resume not found' 
      });
    }

    await cloudinary.uploader.destroy(resume.cloudinaryId);
    await Resume.findByIdAndDelete(req.params.id);
    await Candidate.updateMany(
      { resume: req.params.id },
      { $unset: { resume: 1 } }
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to delete resume'
    });
  }
};