// const { transporter } = require('../config/email');
// const Candidate = require('../models/Candidate');
// const { parseResume } = require('../utils/resumeParser');

// const createCandidate = async (req, res) => {
//   try {
//     const data = req.body;
//     data.resume = req.files?.resume?.[0] || null;
//     data.additionalDocuments = req.files?.additionalDocuments || [];
//     data.userId = req.user._id;

//     const candidate = new Candidate(data);
//     const response = await candidate.save();
//     console.log("ksdnckdcmds",response)
//     res.status(201).json({msg:"Candidate saved!",response});
//   } catch (error) {
//     console.error('Error creating candidate:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


// const getAllCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find();
//     if (candidates.length === 0) {
//       return res.status(200).json({ message: 'No candidates found for this user',candidates:[] });
//     }

//     res.status(200).json({
//       message: 'Jobs and associated JobForms fetched successfully',
//       candidates,
//   });
//   } catch (error) {
//     console.error('Error fetching candidates:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// const getCandidateById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findOne({ _id: req.params.id});
//     if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
//     res.json(candidate);
//   } catch (error) {
//     console.error('Error fetching candidate:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// const editCandidateById = async (req, res) => {
//   try {
//     const updates = req.body;
//     if (req.files?.resume?.[0]) {
//       updates.resume = req.files.resume[0];
//     }
//     if (req.files?.additionalDocuments) {
//       updates.additionalDocuments = req.files.additionalDocuments;
//     }

//     const candidate = await Candidate.findOneAndUpdate(
//       { _id: req.params.id, userId: req.user._id },
//       updates,
//       { new: true }
//     );

//     if (!candidate) return res.status(404).json({ error: 'Candidate not found or not owned' });

//     res.json(candidate);
//   } catch (error) {
//     console.error('Error updating candidate:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// const deletCandidateById = async (req, res) => {
//   try {
//     const deletedCandidate = await Candidate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
//     if (!deletedCandidate) return res.status(404).json({ error: 'Candidate not found or not owned' });

//     res.json({ message: 'Candidate deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting candidate:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// const sendBulEmailToCandidate = async (req, res) => {
//   try {
//     const { recipients, subject, body } = req.body;

//     if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
//       return res.status(400).json({ error: 'Recipients list is required and must be an array.' });
//     }

//     const sendPromises = recipients.map(email => {
//       return transporter.sendMail({
//         from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject,
//         html: body
//       });
//     });

//     await Promise.all(sendPromises);

//     res.status(200).json({ message: 'Emails sent successfully.' });
//   } catch (error) {
//     console.error('Bulk email sending failed:', error);
//     res.status(500).json({ error: 'Failed to send emails.' });
//   }
// }

// const candidateforParticularJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const candidates = await Candidate.find({ jobId }).populate("jobId"); // Optional: populate job details

//     res.status(200).json({ success: true, candidates });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error });
//   }

// }
// module.exports = {
//   createCandidate,
//   getAllCandidates,
//   getCandidateById,
//   editCandidateById,
//   deletCandidateById,
//   sendBulEmailToCandidate,
//   candidateforParticularJob
// };

//-----------

const { transporter } = require('../config/email');
const path = require('path');
const fs = require('fs');


const Candidate = require('../models/Candidate');
const { parseResume } = require('../utils/resumeParser');

const createCandidate = async (req, res) => {
  try {
    const data = req.body;
    data.resume = req.files?.resume?.[0] || null;
    data.additionalDocuments = req.files?.additionalDocuments || [];
    data.userId = req.user._id;

    const candidate = new Candidate(data);
    const response = await candidate.save();
    console.log("candidate saved succesfully",response)
    res.status(201).json({msg:"Candidate saved!",response});
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Error Creating candidate' });
  }
};


const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('stage', 'name')   
      .populate('jobId', 'jobTitle') 
      .populate('userId', 'name'); 

    if (candidates.length === 0) {
      return res.status(200).json({ message: 'No candidates found for this user', candidates: [] });
    }
    res.status(200).json({
      message: 'Jobs and associated JobForms fetched successfully',
      candidates,
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Error fetching candidates' });
  }
};


const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ _id: req.params.id});
    if (!candidate) 
    return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Error fetching candidate with id' });
  }
}

const editCandidateById = async (req, res) => {
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
    res.status(500).json({ error: 'Error updating candidate' });
  }
}

const deletCandidateById = async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedCandidate) return res.status(404).json({ error: 'Candidate not found or not owned' });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Error deleting candidate' });
  }
}

const sendBulEmailToCandidate = async (req, res) => {
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
    res.status(500).json({ error: 'Bulk email sending failed' });
  }
}

const candidateforParticularJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidates = await Candidate.find({ jobId }).populate("jobId"); 
    res.status(200).json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: "failed to update the candidate for particular job", error });
  }

}

const downloadResume = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidate = await Candidate.findById(candidateId);

    if (!candidate || !candidate.resume?.path) {
      return res.status(404).json({ error: 'Resume not found in database records' });
    }

    // Normalize path (remove leading slashes)
    const relativePath = candidate.resume.path.replace(/^\//, '');
    const filePath = path.resolve(__dirname, '..', relativePath); // Goes up from `controllers/` to project root

    // Debug: Log paths
    console.log("Resume path from DB:", candidate.resume.path);
    console.log("Resolved file path:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("File not found. Checked path:", filePath);
      return res.status(404).json({ error: 'Resume file not found on server' });
    }

    // Set headers and stream the file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${candidate.firstName}_${candidate.lastName}_Resume${ext}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const previewResume = async (req, res) => {
  try {
    // 1. Verify candidate exists with resume
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resume?.path) {
      return res.status(404).json({ 
        error: 'Resume not found in database records' 
      });
    }

    // 2. Construct absolute file path (remove any leading slashes)
    const relativePath = candidate.resume.path.replace(/^\//, '');
    const filePath = path.resolve(__dirname, '..', relativePath);

    // 3. Verify file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return res.status(404).json({ 
        error: 'Resume file not found on server' 
      });
    }

    // 4. Only allow PDF previews
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      return res.status(400).json({ 
        error: 'Only PDF files can be previewed' 
      });
    }

    // 5. Stream file with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${candidate.firstName}_${candidate.lastName}_Resume.pdf"`);
    
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file content' });
      }
    });

    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  editCandidateById,
  deletCandidateById,
  sendBulEmailToCandidate,
  candidateforParticularJob,
  downloadResume,
  previewResume
};