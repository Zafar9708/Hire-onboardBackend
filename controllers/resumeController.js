

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
const { extractText, extractSkills, extractExperience } = require('../utils/parserHelpers');


exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No resume file uploaded" 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "resumes" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Extract text from the file
    let extractedText;
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else {
      extractedText = await new Promise((resolve, reject) => {
        textract.fromBufferWithName(req.file.originalname, req.file.buffer, (err, text) => {
          if (err) reject(err);
          else resolve(text);
        });
      });
    }

    // Parse the resume data
    const { firstName, middleName, lastName } = ResumeModel.extractName(extractedText);
    const parsedData = {
      firstName,
      middleName,
      lastName,
      email: ResumeModel.extractEmail(extractedText),
      phone: ResumeModel.extractPhone(extractedText),
      skills: extractSkills(extractedText).split(', '),
      experience: extractExperience(extractedText),
      education: ResumeModel.extractEducation(extractedText),
      url: result.secure_url,
      cloudinaryId: result.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      userId: req.user._id // Assuming you have user authentication
    };

    if (!parsedData.email) {
      // Clean up the uploaded file if parsing fails
      await cloudinary.uploader.destroy(result.public_id);
      throw new Error('No email found in resume');
    }

    const newResume = new Resume(parsedData);
    const savedResume = await newResume.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      ...savedResume._doc
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to upload resume", 
      message: error.message 
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