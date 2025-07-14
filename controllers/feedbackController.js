

const Feedback = require('../models/Feedback');
const mongoose=require('mongoose')
const Interview = require('../models/Interview');
const Interviewer = require('../models/Interviewer');
const { sendFeedbackEmail } = require('../services/emailService');

exports.submitFeedback = async (req, res) => {
    try {
        const { interviewId, interviewerId } = req.params;
        const {
            status,
            technicalSkills,
            communicationSkills,
            problemSolving,
            culturalFit,
            overallFeedback,
            additionalComments
        } = req.body;

        // Validate input
        if (!status || !technicalSkills || !communicationSkills || 
            !problemSolving || !culturalFit || !overallFeedback) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Validate rating values
        const ratings = [technicalSkills, communicationSkills, problemSolving, culturalFit];
        if (ratings.some(rating => rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'All ratings must be between 1 and 5'
            });
        }

        // Get interview details - no need to populate candidate as it's embedded
        const interview = await Interview.findById(interviewId)
            .populate('jobId', '_id')
            .populate('scheduledBy', 'email');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Validate job association
        if (!interview.jobId || !interview.jobId._id) {
            return res.status(400).json({
                success: false,
                message: 'Interview is not associated with a valid job'
            });
        }

        // Verify interviewer exists
        const interviewer = await Interviewer.findById(interviewerId);
        if (!interviewer) {
            return res.status(404).json({
                success: false,
                message: 'Interviewer not found'
            });
        }

        // Check if interviewer was part of this interview
        if (!interview.interviewers || !interview.interviewers.includes(interviewerId)) {
            return res.status(403).json({
                success: false,
                message: 'This interviewer was not part of the specified interview'
            });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ interviewId, interviewerId });
        if (existingFeedback) {
            return res.status(409).json({
                success: false,
                message: 'Feedback already submitted for this interview by this interviewer'
            });
        }

        // Create feedback - use interview.candidate.id for candidateId
        const feedback = new Feedback({
            interviewId,
            interviewerId,
            candidateId: interview.candidate.id, // This is the crucial change
            jobId: interview.jobId._id,
            status,
            technicalSkills: Number(technicalSkills),
            communicationSkills: Number(communicationSkills),
            problemSolving: Number(problemSolving),
            culturalFit: Number(culturalFit),
            overallFeedback: overallFeedback.trim(),
            additionalComments: additionalComments ? additionalComments.trim() : undefined
        });

        await feedback.save();

        // Send email to scheduler if email exists
        if (interview.scheduledBy && interview.scheduledBy.email) {
            await sendFeedbackEmail(
                interview.scheduledBy.email,
                interview,
                feedback,
                interviewer
            );
        }

        res.status(201).json({
            success: true,
            data: feedback,
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getInterviewFeedback = async (req, res) => {
    try {
        const { interviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interview ID'
            });
        }

        const feedbacks = await Feedback.find({ interviewId })
            .populate({
                path: 'interviewerId',
                select: 'name email'
            })
            .populate({
                path: 'jobId',
                select: 'jobName'
            })
            .populate({
                path: 'candidateId',
                select: 'name email'
            })
            .sort({ submittedAt: -1 });

        if (feedbacks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No feedback found for this interview'
            });
        }

        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


exports.getFeedbackByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid candidate ID'
            });
        }

        const feedbacks = await Feedback.find({ candidateId })
            .populate({
                path: 'interviewerId',
                select: 'name email'
            })
            .populate({
                path: 'jobId',
                select: 'jobName'
            })
            .populate({
                path: 'interviewId',
                select: 'interviewDate interviewType'
            })
            .sort({ submittedAt: -1 });

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No feedback found for this candidate'
            });
        }

        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (error) {
        console.error('Error fetching candidate feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};