

const { transporter } = require('../config/email');
const Candidate = require('../models/Candidate');
const { parseResume } = require('../utils/resumeParser');
const mongoose=require('mongoose')


const createCandidate = async (req, res) => {
  try {
    const data = req.body;

    const uploadedFile = req.files?.resume?.[0];
    if (uploadedFile) {
      data.resume = {
        url: uploadedFile.path, // Cloudinary returns the file URL here
        originalName: uploadedFile.originalname
      };
    }

    data.additionalDocuments = req.files?.additionalDocuments || [];
    data.userId = req.user._id;

    const candidate = new Candidate(data);
    const response = await candidate.save();

    console.log("Candidate saved successfully:", response);
    res.status(201).json({ msg: "Candidate saved!", response });
  } catch (error) {
    console.error(' Error creating candidate:', error);
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

          // Track when the candidate entered their current stage
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


module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  editCandidateById,
  deletCandidateById,
  sendBulEmailToCandidate,
  candidateforParticularJob,
  getCandidateStageHistory,
  getStageByCandidateId
};