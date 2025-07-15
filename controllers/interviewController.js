
const { Types } = require('mongoose');
const Interview = require('../models/Interview');
const Interviewer = require('../models/Interviewer');
const EmailTemplate = require('../models/EmailTemplate');
const Feedback = require('../models/Feedback');
const { createGoogleMeet } = require('../services/googleMeetService');
const { createZoomMeeting } = require('../services/zoomService');
const { createTeamsMeeting } = require('../services/teamsService');
const { sendInterviewEmail, sendFeedbackEmail } = require('../services/emailService');

const isValidObjectId = (id) => {
  return Types.ObjectId.isValid(id) && 
         (String)(new Types.ObjectId(id)) === id;
};

const scheduleInterview = async (req, res) => {
    try {
        const {
            candidate,
            interviewerIds,
            date,
            startTime,
            duration,
            timezone,
            platform,
            templateId,
            notes,
            scheduledBy,
            jobId
        } = req.body;

        // Validate required fields
        if (!candidate || !interviewerIds || !date || !startTime || !duration || 
            !timezone || !platform || !templateId || !scheduledBy) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate ObjectId formats
        if (!Array.isArray(interviewerIds) || !interviewerIds.every(isValidObjectId) || 
            !isValidObjectId(templateId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        // Verify interviewers exist
        const interviewers = await Interviewer.find({ 
            _id: { $in: interviewerIds } 
        });

        if (interviewers.length !== interviewerIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more interviewers not found'
            });
        }

        // Verify template exists
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
            return res.status(400).json({
                success: false,
                message: 'Email template not found'
            });
        }

        // Create meeting link
        let meetingLink;
        try {
            const meetingDetails = {
                ...req.body,
                interviewers,
                subject: template.subject
            };

            switch (platform.toLowerCase()) {
                case 'google_meet':
                case 'google meet':
                    meetingLink = await createGoogleMeet(meetingDetails);
                    break;
                case 'zoom':
                    meetingLink = await createZoomMeeting(meetingDetails);
                    break;
                case 'microsoft_teams':
                case 'microsoft teams':
                    meetingLink = await createTeamsMeeting(meetingDetails);
                    break;
                default:
                    meetingLink = null;
            }
        } catch (error) {
            console.error('Meeting creation error:', error);
            return res.status(500).json({
                success: false,
                message: `Failed to create ${platform} meeting`,
                error: error.message
            });
        }

        // Format email body with placeholders
        const formattedDate = new Date(date).toLocaleDateString();
        let emailBody = template.body
        .replace(/{candidate}/g, candidate.name)
        .replace(/{date}/g, formattedDate)
        .replace(/{time}/g, startTime)
        .replace(/{duration}/g, duration)
        .replace(/{timezone}/g, timezone)
        .replace(/{platform}/g, platform)
        // Remove the meeting link from template since we'll add it in sendInterviewEmail
        .replace(/Meeting Link: [^\n]*\n?/g, '')
        // Remove any existing signatures
        .replace(/Best regards,[\s\S]*?(Tech Team|Interview Team|HR Team)/g, '');

        // Create interview record
        const interview = new Interview({
            candidate,
            interviewers: interviewerIds,
            date,
            startTime,
            duration,
            timezone,
            platform,
            meetingLink,
            templateUsed: templateId,
            subject: template.subject,
            emailBody,
            notes,
            scheduledBy,
            jobId
        });

        await interview.save();

        // Generate feedback links and send emails
        try {
            const feedbackLinks = interviewers.map(interviewer => ({
                interviewerId: interviewer._id,
                feedbackLink: `${process.env.FRONTEND_URL}/feedback/${interview._id}/${interviewer._id}`
            }));

            console.log('Generated feedback links:', feedbackLinks);

            const emailPromises = [
                // Email to candidate
                sendInterviewEmail(
                    candidate.email,
                    template.subject,
                    emailBody,
                    meetingLink,
                    'N/A', // No feedback link for candidate
                    candidate.name, // Recipient name
                    'technical' // Default to technical, adjust as needed
                ),
                // Emails to interviewers
                ...interviewers.map(interviewer => {
                    const feedbackLink = feedbackLinks.find(link => 
                        link.interviewerId.toString() === interviewer._id.toString()
                    ).feedbackLink;
                    
                    return sendInterviewEmail(
                        interviewer.email,
                        template.subject,
                        emailBody.replace(/{interviewer}/g, interviewer.name),
                        meetingLink,
                        feedbackLink,
                        interviewer.name, // Recipient name
                        'technical' // Default to technical, adjust as needed
                    );
                })
            ];

            await Promise.all(emailPromises);
            console.log('All emails sent successfully');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the whole operation if emails fail
        }

        res.status(201).json({
            success: true,
            data: interview,
            message: 'Interview scheduled successfully'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getTimezones = (req, res) => {
    const timezones = require('../utils/timezones');
    res.json(timezones);
};

const getDurations = (req, res) => {
    const durations = require('../utils/durations');
    res.json(durations);
};

const getAllInterviews = async (req, res) => {
    try {
        const { jobName, status } = req.query;
        let query = {};

        if (jobName) {
            const matchingJobs = await Job.find({ 
                title: { $regex: jobName, $options: 'i' } 
            }, '_id');
            const jobIds = matchingJobs.map(job => job._id);
            query.jobId = { $in: jobIds };
        }

        if (status) {
            query.status = status;
        }

        const interviews = await Interview.find(query)
            .populate('interviewers', 'name email')
            .populate('templateUsed', 'name')
            .populate('scheduledBy', 'name email')
            .populate('jobId', 'jobName jobTitle')
            .sort({ date: -1, startTime: -1 });

        // Add feedback status for each interview
        const interviewsWithFeedback = await Promise.all(
            interviews.map(async interview => {
                const feedbacks = await Feedback.find({ interviewId: interview._id });
                return {
                    ...interview.toObject(),
                    feedbackStatus: {
                        submitted: feedbacks.length,
                        total: interview.interviewers.length
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            count: interviewsWithFeedback.length,
            data: interviewsWithFeedback
        });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interview ID format'
            });
        }

        const interview = await Interview.findById(id)
            .populate('interviewers', 'name email')
            .populate('templateUsed', 'name subject')
            .populate('scheduledBy', 'name email')
            .populate('jobId', 'jobName jobTitle');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Get feedback for this interview
        const feedbacks = await Feedback.find({ interviewId: id })
            .populate('interviewerId', 'name email');

        res.status(200).json({
            success: true,
            data: {
                ...interview.toObject(),
                feedbacks
            }
        });
    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getUpcomingInterviews = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const interviews = await Interview.find({ 
            date: { $gte: today },
            status: 'scheduled'
        })
        .populate('candidate', 'name email')
        .populate('interviewers', 'name email')
        .populate('jobId', 'jobName jobTitle')
        .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            data: interviews
        });
    } catch (error) {
        console.error('Error fetching upcoming interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getInterviewFeedback = async (req, res) => {
    try {
        const { interviewId } = req.params;

        if (!isValidObjectId(interviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interview ID format'
            });
        }

        const feedbacks = await Feedback.find({ interviewId })
            .populate('interviewerId', 'name email')
            .sort({ submittedAt: -1 });

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
            error: error.message
        });
    }
};

const updateInterviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interview ID format'
            });
        }

        const validStatuses = ['scheduled', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const interview = await Interview.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.status(200).json({
            success: true,
            data: interview,
            message: 'Interview status updated successfully'
        });
    } catch (error) {
        console.error('Error updating interview status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    scheduleInterview,
    getTimezones,
    getDurations,
    getAllInterviews,
    getInterviewById,
    getUpcomingInterviews,
    getInterviewFeedback,
    updateInterviewStatus
};