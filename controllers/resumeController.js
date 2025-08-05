



// const Resume = require('../models/resumeModel').model; 
// const ResumeModel = require('../models/resumeModel'); 
// const Candidate = require('../models/Candidate');
// const cloudinary = require('../config/cloudinary');
// const pdfParse = require('pdf-parse'); 
// const textract = require('textract'); 
// const axios = require('axios')
// const Job = require('../models/Job');
// const {analyzeResumeWithPerplexity} = require('../services/perplexityMatchingService')



// const {
//   extractName,
//   extractEmail,
//   extractPhone,
//   extractSkills,
//   extractExperience,
//   extractEducation
// } = require('../utils/parserHelpers');

// exports.uploadResume = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "No resume file uploaded"
//       });
//     }

//     console.log('File received:', {
//       originalname: req.file.originalname,
//       size: req.file.size,
//       buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'NULL'
//     });
    

//     const cloudinaryResult = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: "auto",
//           type: "upload",
//           folder: "resumes",
//           public_id: `resume_${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, "")}`,
//           flags: 'attachment' 
//         },
//         (error, result) => {
//           if (error) {
//             console.error('Cloudinary upload error:', error);
//             reject(error);
//           } else {
//             console.log('Cloudinary upload successful:', {
//               url: result.secure_url,
//               public_id: result.public_id
//             });
//             resolve(result);
//           }
//         }
//       );
//       uploadStream.end(req.file.buffer);
//     });

//     let extractedText;
//     if (req.file.mimetype === 'application/pdf') {
//       const data = await pdfParse(req.file.buffer);
//       extractedText = data.text;
//     } else {
//       extractedText = await new Promise((resolve, reject) => {
//         textract.fromBufferWithName(req.file.originalname, req.file.buffer, (err, text) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(text);
//           }
//         });
//       });
//     }

//     if (!extractedText || extractedText.trim().length === 0) {
//       await cloudinary.uploader.destroy(cloudinaryResult.public_id);
//       throw new Error("The file appears to be empty or unreadable");
//     }

    

//     const { firstName, middleName, lastName } = extractName(extractedText);
//     const parsedData = {
//       firstName,
//       middleName,
//       lastName,
//       email: extractEmail(extractedText), 
//       phone: extractPhone(extractedText),
//       skills: extractSkills(extractedText).split(', '),
//       experience: extractExperience(extractedText),
//       education: extractEducation(extractedText),
//       url: cloudinaryResult.secure_url,
//       cloudinaryId: cloudinaryResult.public_id,
//       fileType: req.file.mimetype,
//       originalName: req.file.originalname,
//       userId: req.user._id,
//       jobId: req.body.jobId
//     };

//     if (req.body.jobId) {
//       const job = await Job.findById(req.body.jobId);
//       if (job) {
//         console.log('Starting analysis with job:', job.jobTitle);
        
//         const aiAnalysis = await analyzeResumeWithPerplexity(extractedText, job.jobDesc);
//         parsedData.aiAnalysis = aiAnalysis;
//         parsedData.matchingScore = aiAnalysis.matchPercentage;
//         parsedData.status = determineStatus(aiAnalysis);
//       }
//     }

//     const newResume = new Resume(parsedData);
//     const savedResume = await newResume.save();

//     res.status(201).json({
//       success: true,
//       data: savedResume
//     });

//   } catch (error) {
//     console.error('Upload Error:', {
//       message: error.message,
//       stack: error.stack
//     });
    
//     // Clean up Cloudinary upload if something failed
//     // if (cloudinaryResult && cloudinaryResult.public_id) {
//     //   await cloudinary.uploader.destroy(cloudinaryResult.public_id).catch(console.error);
//     // }
    
//     res.status(500).json({
//       success: false,
//       error: 'Failed to process resume',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// function determineStatus(analysis) {
//   if (analysis.source === 'Basic Fallback') {
//     return 'Under Review'; // Default status for fallback cases
//   }

//   switch (analysis.recommendation) {
//     case 'Strong Match':
//       return 'Shortlisted';
//     case 'Moderate Match':
//       return 'Under Review';
//     case 'Weak Match':
//       return 'Rejected';
//     default:
//       return 'New';
//   }
// }


// exports.analyzeResume = async (req, res) => {
//   try {
//     const { resumeText, jobDescription } = req.body;
    
//     if (!resumeText || !jobDescription) {
//       return res.status(400).json({
//         success: false,
//         error: "Both resumeText and jobDescription are required"
//       });
//     }

//     const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);
    
//     res.json({
//       success: true,
//       data: analysis
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Analysis failed'
//     });
//   }
// };

// exports.getAllResumes = async (req, res) => {
//   try {
//     const resumes = await Resume.find().populate('candidateId', 'firstName lastName email');
//     res.json({
//       success: true,
//       count: resumes.length,
//       resumes: resumes.map(resume => ({
//         id: resume._id,
//         url: resume.url,
//         candidateId: resume.candidateId,
//         candidateName: resume.candidateId
//           ? `${resume.candidateId.firstName} ${resume.candidateId.lastName}`
//           : 'Unknown',
//         fileType: resume.fileType,
//         originalName: resume.originalName
//       }))
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Failed to fetch resumes'
//     });
//   }
// };

// exports.getResumeByResumeId=async(req,res)=>{
//   try{
    
//     const resumeData=await Resume.findById(req.params.id)
//     if(!resumeData){
//       return res.status(404).json({
//         success:false,
//         message:"No Resume Found"
//       })
//     }
//     res.status(200).json({
//       success:true,
//       message:"Resume found",
//       resume:resumeData

//     })

//   }catch(err){

//   }
// }

// exports.getResumeById = async (req, res) => {
//   try {
//     // First find the candidate
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume not found for this candidate'
//       });
//     }

//     const resume = await Resume.findById(candidate.resume)
//       .populate('candidateId', 'firstName lastName email');

//     res.json({
//       success: true,
//       resume: {
//         id: resume._id,
//         url: resume.url,
//         candidateId: resume.candidateId,
//         candidateName: `${resume.candidateId.firstName} ${resume.candidateId.lastName}`,
//         fileType: resume.fileType,
//         originalName: resume.originalName,
//         createdAt: resume.createdAt
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Failed to fetch resume'
//     });
//   }
// };

// exports.getCandidateResume = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id).populate('resume');

//     if (!candidate) {
//       return res.status(404).json({
//         success: false,
//         error: 'Candidate not found'
//       });
//     }

//     if (!candidate.resume) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume not found for this candidate'
//       });
//     }

//     res.json({
//       success: true,
//       resume: {
//         id: candidate.resume._id,
//         url: candidate.resume.url,
//         fileType: candidate.resume.fileType,
//         originalName: candidate.resume.originalName
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Failed to fetch resume'
//     });
//   }
// };

// exports.downloadResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);

//     if (!candidate || !candidate.resume) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume not found for this candidate',
//       });
//     }

//     const resume = await Resume.findById(candidate.resume);

//     if (!resume?.url) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume URL missing',
//       });
//     }

//     const fileResponse = await axios.get(resume.url, {
//       responseType: 'stream',
//     });

//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="${resume.originalName}"`
//     );
//     res.setHeader('Content-Type', resume.fileType || 'application/pdf');

//     fileResponse.data.pipe(res);
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Download failed',
//     });
//   }
// };


// exports.previewResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate || !candidate.resume) {
//       return res.status(404).json({ success: false, message: 'Resume not found' });
//     }

//     const resume = await Resume.findById(candidate.resume);
//     if (!resume || !resume.url) {
//       return res.status(404).json({ success: false, message: 'Resume file not found' });
//     }

//     // Fetch with error handling
//     const response = await axios.get(resume.url, {
//       responseType: 'arraybuffer',
//       validateStatus: (status) => status === 200, // Reject non-200 responses
//     });

//     // Set headers before sending
//     res.writeHead(200, {
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `inline; filename="${encodeURIComponent(resume.originalName)}"`,
//       'Content-Length': response.data.length,
//     });

//     return res.end(response.data, 'binary');

//   } catch (error) {
//     console.error('PDF Stream Error:', error.message);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Failed to load PDF',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// };


// exports.deleteResume = async (req, res) => {
//   try {
//     const resume = await Resume.findById(req.params.id);

//     if (!resume) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume not found'
//       });
//     }

//     await cloudinary.uploader.destroy(resume.cloudinaryId);
//     await Resume.findByIdAndDelete(req.params.id);
//     await Candidate.updateMany(
//       { resume: req.params.id },
//       { $unset: { resume: 1 } }
//     );

//     res.json({
//       success: true,
//       message: 'Resume deleted successfully'
//     });
//   } catch (err) {
//     console.error('Delete error:', err);
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Failed to delete resume'
//     });
//   }
// };


//------





const Resume = require('../models/resumeModel').model; 
const ResumeModel = require('../models/resumeModel'); 
const Candidate = require('../models/Candidate');
const cloudinary = require('../config/cloudinary');
const pdfParse = require('pdf-parse'); 
const textract = require('textract'); 
const axios = require('axios')
const Job = require('../models/Job');
const {analyzeResumeWithPerplexity} = require('../services/perplexityMatchingService')



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

    // First upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          type: "upload",
          folder: "resumes",
          public_id: `resume_${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, "")}`,
          flags: 'attachment' 
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
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      throw new Error("The file appears to be empty or unreadable");
    }

    // Extract email (might be null/undefined if not found)
    let extractedEmail = extractEmail(extractedText);
    if (extractedEmail === '') extractedEmail = null;

    // Only check for duplicates if email exists in resume
    if (extractedEmail) {
      const existingResume = await Resume.findOne({ email: extractedEmail });
      if (existingResume) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        return res.status(409).json({
          success: false,
          error: `Email ${extractedEmail} already exists in our system. Please use a different resume with a unique email.`,
          duplicateEmail: true
        });
      }
    }

    const { firstName, middleName, lastName } = extractName(extractedText);
    const parsedData = {
      firstName,
      middleName,
      lastName,
      email: extractedEmail, // Use the processed email (could be null)
      phone: extractPhone(extractedText),
      skills: extractSkills(extractedText).split(', '),
      experience: extractExperience(extractedText),
      education: extractEducation(extractedText),
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      userId: req.user._id,
      jobId: req.body.jobId
    };

    if (req.body.jobId) {
      const job = await Job.findById(req.body.jobId);
      if (job) {
        console.log('Starting analysis with job:', job.jobTitle);
        
        const aiAnalysis = await analyzeResumeWithPerplexity(extractedText, job.jobDesc);
        parsedData.aiAnalysis = aiAnalysis;
        parsedData.matchingScore = aiAnalysis.matchPercentage;
        parsedData.status = determineStatus(aiAnalysis);
      }
    }

    const newResume = await Resume.create(parsedData);

    const response = {
      success: true,
      data: newResume
    };

    if (!extractedEmail) {
      response.warning = "No email found in resume. Please add manually.";
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Upload Error:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process resume',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

function determineStatus(analysis) {
  if (analysis.source === 'Basic Fallback') {
    return 'Under Review'; // Default status for fallback cases
  }

  switch (analysis.recommendation) {
    case 'Strong Match':
      return 'Shortlisted';
    case 'Moderate Match':
      return 'Under Review';
    case 'Weak Match':
      return 'Rejected';
    default:
      return 'New';
  }
}


exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Both resumeText and jobDescription are required"
      });
    }

    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
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

exports.getResumeByResumeId=async(req,res)=>{
  try{
    
    const resumeData=await Resume.findById(req.params.id)
    if(!resumeData){
      return res.status(404).json({
        success:false,
        message:"No Resume Found"
      })
    }
    res.status(200).json({
      success:true,
      message:"Resume found",
      resume:resumeData

    })

  }catch(err){

  }
}

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

// exports.downloadResumeById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate || !candidate.resume) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Candidate or resume not found in database'
//       });
//     }

//     const resume = await Resume.findById(candidate.resume);
//     if (!resume) {
//       return res.status(404).json({
//         success: false,
//         error: 'Resume record not found'
//       });
//     }

//     try {
//       const fileInfo = await cloudinary.api.resource(resume.cloudinaryId);
//       console.log('File exists in Cloudinary:', {
//         public_id: fileInfo.public_id,
//         format: fileInfo.format,
//         bytes: fileInfo.bytes
//       });
//     } catch (cloudinaryErr) {
//       console.error('Cloudinary verification failed:', cloudinaryErr);
//       return res.status(404).json({
//         success: false,
//         error: 'Resume file not found in Cloudinary storage',
//         solution: 'Please re-upload the resume file'
//       });
//     }

//     const downloadUrl = cloudinary.url(resume.cloudinaryId, {
//       secure: true,
//       sign_url: true,
//       resource_type: 'raw',
//       type: 'authenticated',
//       flags: 'attachment'
//     });

//     console.log('Final download URL:', downloadUrl);

//     const response = await axios.get(downloadUrl, {
//       responseType: 'stream',
//       timeout: 30000
//     });

//     res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resume.originalName)}"`);
//     res.setHeader('Content-Type', resume.fileType || 'application/pdf');
    
//     response.data.pipe(res);

//     response.data.on('error', (streamError) => {
//       console.error('Stream error:', streamError);
//       if (!res.headersSent) {
//         res.status(500).json({ 
//           success: false,
//           error: 'File stream error occurred'
//         });
//       }
//     });

//   } catch (err) {
//     console.error('Final download error:', {
//       message: err.message,
//       stack: err.stack,
//       timestamp: new Date()
//     });

//     if (err.message.includes('not found') || err.response?.status === 404) {
//       return res.status(404).json({
//         success: false,
//         error: 'The requested file could not be located',
//         solution: 'Verify the file exists in Cloudinary'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'Failed to process download request',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

exports.downloadResumeById = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`Starting resume download for candidate ${id}`);

    // 1. Get candidate with resume populated
    const candidate = await Candidate.findById(id).populate('resume');
    if (!candidate) {
      return res.status(404).json({ 
        success: false,
        error: 'Candidate not found'
      });
    }

    if (!candidate.resume) {
      return res.status(404).json({
        success: false,
        error: 'No resume associated with this candidate'
      });
    }

    const resume = candidate.resume;

    // 2. Generate download URL - FORCE RAW DOWNLOAD REGARDLESS OF UPLOAD TYPE
    const downloadUrl = cloudinary.url(resume.cloudinaryId, {
      secure: true,
      sign_url: true,
      resource_type: 'raw', // Always use raw for download
      type: 'authenticated',
      flags: 'attachment',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });

    console.log('Generated download URL:', downloadUrl);

    // 3. Stream file to client
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'Accept': 'application/pdf',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // Set proper headers
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resume.originalName)}"`);
      res.setHeader('Content-Type', resume.fileType || 'application/pdf');
      
      // Pipe the stream
      response.data.pipe(res);

      response.data.on('error', (streamError) => {
        console.error('Download stream error:', streamError.message);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false,
            error: 'File download failed during transfer'
          });
        }
      });

    } catch (downloadError) {
      console.error('Download request failed:', {
        message: downloadError.message,
        url: downloadUrl,
        status: downloadError.response?.status,
        headers: downloadError.response?.headers
      });
      
      // Special handling for Cloudinary errors
      if (downloadError.response?.headers?.['x-cld-error']) {
        return res.status(400).json({
          success: false,
          error: 'Failed to download file',
          solution: 'The file may need to be re-uploaded',
          details: process.env.NODE_ENV === 'development' ? {
            cloudinaryError: downloadError.response.headers['x-cld-error'],
            cloudinaryId: resume.cloudinaryId
          } : undefined
        });
      }
      
      return res.status(502).json({
        success: false,
        error: 'Failed to retrieve file from storage',
        details: process.env.NODE_ENV === 'development' ? {
          status: downloadError.response?.status
        } : undefined
      });
    }

  } catch (err) {
    console.error('Resume download process failed:', err.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process download request',
      details: process.env.NODE_ENV === 'development' ? {
        error: err.message
      } : undefined
    });
  }
};

exports.previewResumeById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('resume');

    if (!candidate || !candidate.resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Get signed URL for preview
    const signedUrl = cloudinary.url(candidate.resume.cloudinaryId, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
      flags: 'inline'
    });

    return res.redirect(signedUrl);

  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview link'
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


