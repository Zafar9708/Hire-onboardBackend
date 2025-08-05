// const { transporter } = require('../config/email');
// const Candidate = require('../models/Candidate');
// const { parseResume } = require('../utils/resumeParser');
// const mongoose=require('mongoose')
// const Resume = require('../models/resumeModel').model;
// const ResumeModel = require('../models/resumeModel');
// const pdfParse = require('pdf-parse');
// const textract = require('textract');
// const cloudinary = require('../config/cloudinary');


// const createCandidate = async (req, res) => {
//   try {
//     const data = req.body;
//     const uploadedFile = req.file;
//     const jobId = data.jobId;

//     if (uploadedFile) {
//       try {
//         const cloudinaryResult = await new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             { 
//               resource_type: "auto",
//               folder: "resumes",
//               public_id: `resume_${Date.now()}_${uploadedFile.originalname.replace(/\.[^/.]+$/, "")}`
//             },
//             (error, result) => error ? reject(error) : resolve(result)
//           );
//           uploadStream.end(uploadedFile.buffer);
//         });

//         let extractedText;
//         if (uploadedFile.mimetype === 'application/pdf') {
//           const data = await pdfParse(uploadedFile.buffer);
//           extractedText = data.text;
//         } else {
//           extractedText = await new Promise((resolve, reject) => {
//             textract.fromBufferWithName(uploadedFile.originalname, uploadedFile.buffer, 
//               (err, text) => err ? reject(err) : resolve(text));
//           });
//         }

//         const { firstName, middleName, lastName } = extractName(extractedText);
//         const resume = await Resume.create({
//           firstName: firstName || data.firstName,
//           middleName: middleName || data.middleName,
//           lastName: lastName || data.lastName,
//           email: extractEmail(extractedText) || data.email,
//           phone: extractPhone(extractedText) || data.mobile,
//           skills: extractSkills(extractedText).split(', ') || data.skills,
//           experience: extractExperience(extractedText) || data.experience,
//           education: extractEducation(extractedText) || data.education,
//           url: cloudinaryResult.secure_url,
//           cloudinaryId: cloudinaryResult.public_id,
//           fileType: uploadedFile.mimetype,
//           originalName: uploadedFile.originalname,
//           jobId: jobId,
//           userId: req.user._id
//         });

//         data.resume = resume._id;
//       } catch (resumeError) {
//         console.error('Resume processing error:', resumeError);
//       }
//     }

//     // Create candidate
//     const candidate = new Candidate({
//       ...data,
//       userId: req.user._id
//     });
//     const savedCandidate = await candidate.save();

//     // Update resume with candidateId if exists
//     if (savedCandidate.resume) {
//       await Resume.findByIdAndUpdate(savedCandidate.resume, {
//         candidateId: savedCandidate._id
//       });
//     }

//     // Return fully populated candidate
//     const result = await Candidate.findById(savedCandidate._id)
//       .populate('resume')
//       .populate('jobId')
//       .populate('stage');

//     res.status(201).json({
//       success: true,
//       message: "Candidate created successfully",
//       candidate: result
//     });

//   } catch (error) {
//     console.error('Error creating candidate:', error);
//     res.status(500).json({ 
//       success: false,
//       error: error.message || 'Error creating candidate' 
//     });
//   }
// };


// const getAllCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find()
//       .populate('stage', 'name')   
//       .populate('jobId', 'jobTitle') 
//       .populate('userId', 'name'); 

//     if (candidates.length === 0) {
//       return res.status(200).json({ message: 'No candidates found for this user', candidates: [] });
//     }
//     res.status(200).json({
//       message: 'Jobs and associated JobForms fetched successfully',
//       candidates,
//     });
//   } catch (error) {
//     console.error('Error fetching candidates:', error);
//     res.status(500).json({ error: 'Error fetching candidates' });
//   }
// };


// const getCandidateById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findOne({ _id: req.params.id })
//       .populate('stage', 'name')
//       .populate('jobId', 'jobTitle')
//       .populate('userId', 'name');

//     if (!candidate) {
//       return res.status(404).json({ error: 'Candidate not found' });
//     }

//     res.json(candidate);
//   } catch (error) {
//     console.error('Error fetching candidate:', error);
//     res.status(500).json({ error: 'Error fetching candidate with id' });
//   }
// };


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
//     res.status(500).json({ error: 'Error updating candidate' });
//   }
// }

// const deletCandidateById = async (req, res) => {
//   try {
//     const deletedCandidate = await Candidate.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
//     if (!deletedCandidate) return res.status(404).json({ error: 'Candidate not found or not owned' });
//     res.json({ message: 'Candidate deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting candidate:', error);
//     res.status(500).json({ error: 'Error deleting candidate' });
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
//     res.status(500).json({ error: 'Bulk email sending failed' });
//   }
// }

// const candidateforParticularJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const candidates = await Candidate.find({ jobId }).populate("jobId"); 
//     res.status(200).json({ success: true, candidates });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "failed to update the candidate for particular job", error });
//   }

// }

// const getCandidateStageHistory = async (req, res) => {
//   try {
//     const candidates = await Candidate.find()
//       .populate('stage', 'name')        // populate stage name
//       .populate('jobId', 'jobTitle')    // populate job title
//       .populate('userId', 'name');      // populate user name

//     const result = candidates.map((candidate) => {
//       const history = [];
//       let currentStageDate = null;

//       // Sort comments by change date
//       const sortedComments = [...candidate.comments].sort(
//         (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
//       );

//       sortedComments.forEach((comment) => {
//         if (comment.stageChangedTo) {
//           history.push({
//             from: comment.stageChangedFrom || "Unknown",
//             to: comment.stageChangedTo,
//             changedAt: comment.changedAt,
//           });

//           if (
//             comment.stageChangedTo === candidate.stage?.name &&
//             (!currentStageDate || new Date(comment.changedAt) > new Date(currentStageDate))
//           ) {
//             currentStageDate = comment.changedAt;
//           }
//         }
//       });

//       return {
//         candidateId: candidate._id,
//         name: `${candidate.firstName} ${candidate.middleName || ""} ${candidate.lastName}`.trim(),
//         currentStage: candidate.stage?.name || "Not Assigned",
//         currentStageSince: currentStageDate,
//         jobTitle: candidate.jobId?.jobTitle || "N/A",
//         history,
//       };
//     });

//     res.status(200).json({
//       message: "Candidate stage history fetched successfully",
//       candidates: result,
//     });
//   } catch (error) {
//     console.error("Error in getCandidateStageHistory:", error);
//     res.status(500).json({ error: "Failed to fetch candidate stage history" });
//   }
// };

// const getStageByCandidateId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid candidate ID format" });
//     }

//     const candidate = await Candidate.findById(id)
//       .populate('stage', 'name')
//       .populate('jobId', 'jobTitle')
//       .populate('userId', 'name');

//     if (!candidate) {
//       return res.status(404).json({ error: "Candidate not found" });
//     }

//     // Sort comments by date
//     const sortedComments = [...candidate.comments].sort(
//       (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
//     );

//     let currentStageDate = null;
//     const history = [];

//     sortedComments.forEach((comment) => {
//       if (comment.stageChangedTo) {
//         history.push({
//           from: comment.stageChangedFrom || "Unknown",
//           to: comment.stageChangedTo,
//           changedAt: comment.changedAt,
//         });

//         if (
//           comment.stageChangedTo === candidate.stage?.name &&
//           (!currentStageDate || new Date(comment.changedAt) > new Date(currentStageDate))
//         ) {
//           currentStageDate = comment.changedAt;
//         }
//       }
//     });

//     res.status(200).json({
//       candidateId: candidate._id,
//       name: `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim(),
//       jobTitle: candidate.jobId?.jobTitle || 'N/A',
//       currentStage: candidate.stage?.name || 'Not Assigned',
//       currentStageSince: currentStageDate,
//       history,
//     });
//   } catch (error) {
//     console.error("Error getting stage by candidate ID:", error);
//     res.status(500).json({ error: "Failed to fetch stage info" });
//   }
// };


// module.exports = {
//   createCandidate,
//   getAllCandidates,
//   getCandidateById,
//   editCandidateById,
//   deletCandidateById,
//   sendBulEmailToCandidate,
//   candidateforParticularJob,
//   getCandidateStageHistory,
//   getStageByCandidateId
// };



const { transporter } = require('../config/email');
const Candidate = require('../models/Candidate');
const { parseResume } = require('../utils/resumeParser');
const mongoose=require('mongoose')
const Resume = require('../models/resumeModel').model;
const ResumeModel = require('../models/resumeModel');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const cloudinary = require('../config/cloudinary');


const createCandidate = async (req, res) => {
  try {
    const data = req.body;
    const uploadedFile = req.file;
    const jobId = data.jobId;

    if (uploadedFile) {
      try {
        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "raw",
              folder: "resumes",
              public_id: `resume_${Date.now()}_${uploadedFile.originalname.replace(/\.[^/.]+$/, "")}`
            },
            (error, result) => error ? reject(error) : resolve(result)
          );
          uploadStream.end(uploadedFile.buffer);
        });

        let extractedText;
        if (uploadedFile.mimetype === 'application/pdf') {
          const data = await pdfParse(uploadedFile.buffer);
          extractedText = data.text;
        } else {
          extractedText = await new Promise((resolve, reject) => {
            textract.fromBufferWithName(uploadedFile.originalname, uploadedFile.buffer, 
              (err, text) => err ? reject(err) : resolve(text));
          });
        }

        const { firstName, middleName, lastName } = extractName(extractedText);
        const resume = await Resume.create({
          firstName: firstName || data.firstName,
          middleName: middleName || data.middleName,
          lastName: lastName || data.lastName,
          email: extractEmail(extractedText) || data.email,
          phone: extractPhone(extractedText) || data.mobile,
          skills: extractSkills(extractedText).split(', ') || data.skills,
          experience: extractExperience(extractedText) || data.experience,
          education: extractEducation(extractedText) || data.education,
          url: cloudinaryResult.secure_url,
          cloudinaryId: cloudinaryResult.public_id,
          fileType: uploadedFile.mimetype,
          originalName: uploadedFile.originalname,
          jobId: jobId,
          userId: req.user._id
        });

        data.resume = resume._id;
      } catch (resumeError) {
        console.error('Resume processing error:', resumeError);
      }
    }

    // Create candidate
    const candidate = new Candidate({
      ...data,
      userId: req.user._id
    });
    const savedCandidate = await candidate.save();

    // Update resume with candidateId if exists
    if (savedCandidate.resume) {
      await Resume.findByIdAndUpdate(savedCandidate.resume, {
        candidateId: savedCandidate._id
      });
    }

    // Return fully populated candidate
    const result = await Candidate.findById(savedCandidate._id)
      .populate('resume')
      .populate('jobId')
      .populate('stage');

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidate: result
    });

  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error creating candidate' 
    });
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
    const candidate = await Candidate.findOne({ _id: req.params.id })
      .populate('stage', 'name')
      .populate('jobId', 'jobTitle')
      .populate('userId', 'name');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Error fetching candidate with id' });
  }
};


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

const getCandidateStageHistory = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('stage', 'name')        // populate stage name
      .populate('jobId', 'jobTitle')    // populate job title
      .populate('userId', 'name');      // populate user name

    const result = candidates.map((candidate) => {
      const history = [];
      let currentStageDate = null;

      // Sort comments by change date
      const sortedComments = [...candidate.comments].sort(
        (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
      );

      sortedComments.forEach((comment) => {
        if (comment.stageChangedTo) {
          history.push({
            from: comment.stageChangedFrom || "Unknown",
            to: comment.stageChangedTo,
            changedAt: comment.changedAt,
          });

          if (
            comment.stageChangedTo === candidate.stage?.name &&
            (!currentStageDate || new Date(comment.changedAt) > new Date(currentStageDate))
          ) {
            currentStageDate = comment.changedAt;
          }
        }
      });

      return {
        candidateId: candidate._id,
        name: `${candidate.firstName} ${candidate.middleName || ""} ${candidate.lastName}`.trim(),
        currentStage: candidate.stage?.name || "Not Assigned",
        currentStageSince: currentStageDate,
        jobTitle: candidate.jobId?.jobTitle || "N/A",
        history,
      };
    });

    res.status(200).json({
      message: "Candidate stage history fetched successfully",
      candidates: result,
    });
  } catch (error) {
    console.error("Error in getCandidateStageHistory:", error);
    res.status(500).json({ error: "Failed to fetch candidate stage history" });
  }
};

const getStageByCandidateId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid candidate ID format" });
    }

    const candidate = await Candidate.findById(id)
      .populate('stage', 'name')
      .populate('jobId', 'jobTitle')
      .populate('userId', 'name');

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Sort comments by date
    const sortedComments = [...candidate.comments].sort(
      (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
    );

    let currentStageDate = null;
    const history = [];

    sortedComments.forEach((comment) => {
      if (comment.stageChangedTo) {
        history.push({
          from: comment.stageChangedFrom || "Unknown",
          to: comment.stageChangedTo,
          changedAt: comment.changedAt,
        });

        if (
          comment.stageChangedTo === candidate.stage?.name &&
          (!currentStageDate || new Date(comment.changedAt) > new Date(currentStageDate))
        ) {
          currentStageDate = comment.changedAt;
        }
      }
    });

    res.status(200).json({
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim(),
      jobTitle: candidate.jobId?.jobTitle || 'N/A',
      currentStage: candidate.stage?.name || 'Not Assigned',
      currentStageSince: currentStageDate,
      history,
    });
  } catch (error) {
    console.error("Error getting stage by candidate ID:", error);
    res.status(500).json({ error: "Failed to fetch stage info" });
  }
};

const getCandidateResumeAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate candidate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate ID format'
      });
    }

    // Find candidate and populate job details including timestamps
    const candidate = await Candidate.findById(id)
      .populate({
        path: 'jobId',
        select: 'jobName jobTitle department experience jobDesc status createdAt updatedAt'
      })
      .populate('stage', 'name')
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if candidate has a resume
    if (!candidate.resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this candidate'
      });
    }

    // Get resume with analysis data
    const resume = await Resume.findById(candidate.resume)
      .select('firstName middleName lastName email phone skills experience education url aiAnalysis matchingScore status parsedAt updatedAt')
      .lean();

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume data not found'
      });
    }

    // Prepare response data with job details
    const responseData = {
      candidateInfo: {
        _id: candidate._id,
        name: `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim(),
        currentStage: candidate.stage?.name || 'Not assigned',
        jobDetails: {
          jobId: candidate.jobId?._id || null,
          jobName: candidate.jobId?.jobName || 'N/A',
          jobTitle: candidate.jobId?.jobTitle || 'N/A',
          department: candidate.jobId?.department || 'N/A',
          experience: candidate.jobId?.experience || 'N/A',
          jobDesc: candidate.jobId?.jobDesc || 'No description available',
          jobStatus: candidate.jobId?.status || 'N/A',
          createdAt: candidate.jobId?.createdAt || null,
          updatedAt: candidate.jobId?.updatedAt || null
        },
        source: candidate.source || 'Unknown',
        availableToJoin: candidate.availableToJoin,
        location: {
          current: candidate.currentLocation,
          preferred: candidate.preferredLocation
        }
      },
      resumeAnalysis: {
        _id: resume._id,
        matchPercentage: resume.aiAnalysis?.matchPercentage || 0,
        matchingScore: resume.matchingScore || 0,
        status: resume.status || 'Not analyzed',
        recommendation: resume.aiAnalysis?.recommendation || 'Not available',
        skills: {
          matching: resume.aiAnalysis?.matchingSkills || [],
          missing: resume.aiAnalysis?.missingSkills || []
        },
        analysis: {
          overall: resume.aiAnalysis?.analysis || '',
          experience: resume.aiAnalysis?.experienceMatch || '',
          education: resume.aiAnalysis?.educationMatch || ''
        },
        resumeUrl: resume.url,
        parsedAt: resume.parsedAt || resume.createdAt, // Fallback to createdAt if parsedAt doesn't exist
        lastUpdated: resume.updatedAt
      },
      timestamps: {
        jobCreated: candidate.jobId?.createdAt || null,
        jobUpdated: candidate.jobId?.updatedAt || null,
        resumeParsed: resume.parsedAt || resume.createdAt,
        resumeUpdated: resume.updatedAt
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching candidate resume analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate resume analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  getCandidateStageHistory,
  getStageByCandidateId,
  getCandidateResumeAnalysis
};