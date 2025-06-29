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
module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  editCandidateById,
  deletCandidateById,
  sendBulEmailToCandidate,
  candidateforParticularJob
};