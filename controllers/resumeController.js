// const ResumeModel = require('../models/resumeModel');
// const candidate=require('../models/Candidate');
// const Candidate = require('../models/Candidate');
// const path=require('path')
// const fs=require('fs')


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


// exports.getResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume || !candidate.resume.path) {
//       return res.status(404).json({ success: false, message: 'Resume not found' });
//     }

//     const resumePath = path.join(__dirname, '..', candidate.resume.path);

//     if (!fs.existsSync(resumePath)) {
//       return res.status(404).json({ success: false, message: 'File not found on server' });
//     }

//     // Set content type
//     const ext = path.extname(resumePath).toLowerCase();
//     const contentType = {
//       '.pdf': 'application/pdf',
//       '.doc': 'application/msword',
//       '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     }[ext] || 'application/octet-stream';

//     res.setHeader('Content-Type', contentType);
//     res.sendFile(resumePath);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
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

// exports.downloadResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume || !candidate.resume.path) {
//       return res.status(404).json({ success: false, message: 'Resume not found' });
//     }

//     const resumePath = path.join(__dirname, '..', candidate.resume.path);

//     if (!fs.existsSync(resumePath)) {
//       return res.status(404).json({ success: false, message: 'Resume file not found on server' });
//     }

//     // Set the file name for download
//     const originalName = candidate.resume.originalName || 'resume';

//     return res.download(resumePath, originalName); // this sends Content-Disposition: attachment
//   } catch (err) {
//     console.error('Download error:', err);
//     return res.status(500).json({ success: false, message: 'Server error while downloading resume' });
//   }
// };


//----------this is for uploading resume on server 

const path = require('path');
const fs = require('fs');
const Candidate = require('../models/Candidate');




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

// Resume fetch (for viewing in browser)
exports.getResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume || !candidate.resume.path) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const resumePath = candidate.resume.path;

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    const ext = path.extname(resumePath).toLowerCase();
    const contentType = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.sendFile(resumePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Resume download
exports.downloadResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resume || !candidate.resume.path) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const resumePath = candidate.resume.path;

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' });
    }

    const originalName = candidate.resume.originalName || 'resume.pdf';
    return res.download(resumePath, originalName);
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ success: false, message: 'Server error while downloading resume' });
  }
};
