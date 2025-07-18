

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
    if (!req.file?.cloudinary) {
      return res.status(400).json({ 
        success: false,
        error: 'File processing failed' 
      });
    }

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resumeData = {
      url: req.file.cloudinary.url,
      cloudinaryId: req.file.cloudinary.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      userId: req.user._id
    };

    // If candidateId is provided in the request
    if (req.body.candidateId) {
      resumeData.candidateId = req.body.candidateId;
      
      // Update candidate's resume reference
      await Candidate.findByIdAndUpdate(
        req.body.candidateId,
        { resume: resumeData.cloudinaryId },
        { new: true }
      );
    }

    const resume = await Resume.create(resumeData);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        url: resume.url,
        candidateId: resume.candidateId,
        userId: resume.userId
      }
    });

  } catch (err) {
    console.error('Upload error:', err);
    
    // Cleanup uploaded file if error occurred
    if (req.file?.cloudinary?.public_id) {
      await cloudinary.uploader.destroy(req.file.cloudinary.public_id)
        .catch(cleanupErr => console.error('Cleanup error:', cleanupErr));
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload resume',
      message: err.message
    });
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