



const Resume = require('../models/resumeModel').model; // Changed this line
const ResumeModel = require('../models/resumeModel'); // Added this line
const Candidate = require('../models/Candidate');
const cloudinary = require('../config/cloudinary');
const pdfParse = require('pdf-parse'); // Added this line
const textract = require('textract'); // Added this line
const axios = require('axios')
const { calculateMatchScore } = require('../services/matchingService');
const Job = require('../models/Job'); 


const {
  extractName,
  extractEmail,
  extractPhone,
  extractSkills,
  extractExperience,
  extractEducation
} = require('../utils/parserHelpers');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No resume file uploaded"
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'NULL'
    });

    // Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // ✅ Treat PDFs and docs correctly
          type: "upload",       // ✅ Ensure file is PUBLIC
          folder: "resumes",
          public_id: `resume_${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, "")}`
        },

        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', {
              url: result.secure_url,
              public_id: result.public_id
            });
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Extract text from resume
    let extractedText;
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else {
      extractedText = await new Promise((resolve, reject) => {
        textract.fromBufferWithName(req.file.originalname, req.file.buffer, (err, text) => {
          if (err) {
            reject(err);
          } else {
            resolve(text);
          }
        });
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("The file appears to be empty or unreadable");
    }

    // Parse resume data
    const { firstName, middleName, lastName } = extractName(extractedText);
    const parsedData = {
      firstName,
      middleName,
      lastName,
      email: extractEmail(extractedText),
      phone: extractPhone(extractedText),
      skills: extractSkills(extractedText).split(', '),
      experience: extractExperience(extractedText),
      education: extractEducation(extractedText),
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      userId: req.user._id,
      jobId: req.body.jobId // Make sure to include jobId in your request
    };

    if (!parsedData.email) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      throw new Error("No email found in resume");
    }

    const newResume = new Resume(parsedData);
    const savedResume = await newResume.save();

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: savedResume
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload resume'
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
    // First find the candidate
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found for this candidate'
      });
    }

    const resume = await Resume.findById(candidate.resume)
      .populate('candidateId', 'firstName lastName email');

    res.json({
      success: true,
      resume: {
        id: resume._id,
        url: resume.url,
        candidateId: resume.candidateId,
        candidateName: `${resume.candidateId.firstName} ${resume.candidateId.lastName}`,
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
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found for this candidate',
      });
    }

    const resume = await Resume.findById(candidate.resume);

    if (!resume?.url) {
      return res.status(404).json({
        success: false,
        error: 'Resume URL missing',
      });
    }

    const fileResponse = await axios.get(resume.url, {
      responseType: 'stream',
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.originalName}"`
    );
    res.setHeader('Content-Type', resume.fileType || 'application/pdf');

    fileResponse.data.pipe(res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Download failed',
    });
  }
};



exports.previewResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resume) {
      return res.status(404).json({ success: false, error: 'Resume not found for this candidate' });
    }

    const resume = await Resume.findById(candidate.resume);
    if (!resume?.url) {
      return res.status(404).json({ success: false, error: 'Resume URL missing' });
    }

    const response = await axios.get(resume.url, { responseType: 'stream' });

    res.setHeader('Content-Disposition', `inline; filename="${resume.originalName}"`);
    res.setHeader('Content-Type', resume.fileType || 'application/pdf');

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Preview failed' });
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


