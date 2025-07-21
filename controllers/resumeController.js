

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

const Resume = require('../models/resumeModel').model; // Changed this line
const ResumeModel = require('../models/resumeModel'); // Added this line
const Candidate = require('../models/Candidate');
const cloudinary = require('../config/cloudinary');
const pdfParse = require('pdf-parse'); // Added this line
const textract = require('textract'); // Added this line

exports.uploadResume = async (req, res) => {
  console.log('=== STARTING RESUME UPLOAD ===');
  
  try {
    // 1. Check if file exists
    console.log('[1/7] Checking file existence...');
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ 
        success: false, 
        error: "No resume file uploaded" 
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length
    });

    // 2. Validate file buffer
    console.log('[2/7] Validating file buffer...');
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error('Empty file buffer detected');
      return res.status(400).json({ 
        success: false, 
        error: "Empty file buffer" 
      });
    }

    // 3. Extract text
    console.log('[3/7] Extracting text from file...');
    let extractedText;
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('Processing PDF file...');
        const data = await pdfParse(req.file.buffer);
        extractedText = data.text;
        console.log('PDF text extracted (first 100 chars):', extractedText.substring(0, 100));
      } else {
        console.log('Processing DOC/DOCX file...');
        extractedText = await new Promise((resolve, reject) => {
          textract.fromBufferWithName(req.file.originalname, req.file.buffer, (err, text) => {
            if (err) {
              console.error('Textract error:', err);
              reject(err);
            } else {
              console.log('DOC text extracted (first 100 chars):', text.substring(0, 100));
              resolve(text);
            }
          });
        });
      }
    } catch (extractErr) {
      console.error('Text extraction failed:', extractErr);
      return res.status(400).json({
        success: false,
        error: "Failed to extract text",
        message: extractErr.message
      });
    }

    // 4. Validate extracted text
    console.log('[4/7] Validating extracted text...');
    if (!extractedText || extractedText.trim().length === 0) {
      console.error('Empty text extracted from file');
      return res.status(400).json({
        success: false,
        error: "Empty content",
        message: "The file appears to be empty or unreadable"
      });
    }

    // 5. Upload to Cloudinary
    console.log('[5/7] Uploading to Cloudinary...');
    let cloudinaryResult;
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: "auto",
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
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
      return res.status(500).json({
        success: false,
        error: "Cloudinary upload failed",
        message: uploadErr.message
      });
    }

    // 6. Parse resume data
    console.log('[6/7] Parsing resume data...');
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
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      userId: req.user._id
    };

    console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

    if (!parsedData.email) {
      console.error('No email found in resume');
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      return res.status(400).json({
        success: false,
        error: "Invalid resume",
        message: "No email found in resume"
      });
    }

    // 7. Save to database
    console.log('[7/7] Saving to database...');
    const newResume = new Resume(parsedData);
    const savedResume = await newResume.save();
    console.log('Resume saved successfully:', savedResume._id);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: savedResume
    });
  } catch (error) {
    console.error('!!! UNHANDLED UPLOAD ERROR !!!', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to upload resume", 
      message: error.message 
    });
  } finally {
    console.log('=== UPLOAD PROCESS COMPLETED ===');
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