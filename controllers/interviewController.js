


const { Types } = require('mongoose');
const Interview = require('../models/Interview');
const Interviewer = require('../models/Interviewer');
const EmailTemplate = require('../models/EmailTemplate');
const { createGoogleMeet } = require('../services/googleMeetService');
const { createZoomMeeting } = require('../services/zoomService');
const { createTeamsMeeting } = require('../services/teamsService');
const { sendInterviewEmail } = require('../services/emailService');

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
            scheduledBy
        } = req.body;

        if (!candidate || !interviewerIds || !date || !startTime || !duration || 
            !timezone || !platform || !templateId || !scheduledBy) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!Array.isArray(interviewerIds) || !interviewerIds.every(isValidObjectId) || 
            !isValidObjectId(templateId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const interviewers = await Interviewer.find({ 
            _id: { $in: interviewerIds } 
        });

        if (interviewers.length !== interviewerIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more interviewers not found'
            });
        }

        const template = await EmailTemplate.findById(templateId);
        if (!template) {
            return res.status(400).json({
                success: false,
                message: 'Email template not found'
            });
        }

        let meetingLink;
        try {
            const meetingDetails = {
                ...req.body,
                interviewers,
                subject: template.subject
            };

            switch (platform) {
                case 'google_meet':
                    meetingLink = await createGoogleMeet(meetingDetails);
                    break;
                case 'zoom':
                    meetingLink = await createZoomMeeting(meetingDetails);
                    break;
                case 'microsoft_teams':
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

        const formattedDate = new Date(date).toLocaleDateString();
        let emailBody = template.body
            .replace(/{candidate}/g, candidate.name)
            .replace(/{date}/g, formattedDate)
            .replace(/{time}/g, startTime)
            .replace(/{duration}/g, duration)
            .replace(/{timezone}/g, timezone)
            .replace(/{meetingLink}/g, meetingLink || 'To be provided');

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
            scheduledBy
        });

        await interview.save();

        try {
            const emailPromises = [
                sendInterviewEmail(
                    candidate.email,
                    template.subject,
                    emailBody,
                    meetingLink
                ),
                ...interviewers.map(interviewer => 
                    sendInterviewEmail(
                        interviewer.email,
                        template.subject,
                        emailBody,
                        meetingLink
                    )
                )
            ];

            await Promise.all(emailPromises);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
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


//for round and address 

exports.getRounds = async (req, res) => {
    try {
      const rounds = await Round.find({ active: true });
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getAddresses = async (req, res) => {
    try {
      const addresses = await Address.find({ active: true });
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate('interviewers', 'name email')
            .populate('templateUsed', 'name')
            .populate('scheduledBy', 'name email')
            .sort({ date: -1, startTime: -1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            data: interviews
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
            .populate('scheduledBy', 'name email');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.status(200).json({
            success: true,
            data: interview
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
            date: { $gte: today } 
        })
        .populate('candidate', 'name email')
        .populate('interviewers', 'name email')
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

module.exports = {
    scheduleInterview,
    getTimezones,
    getDurations,
    getAllInterviews,
    getInterviewById,
    getUpcomingInterviews,

};