
const OfflineInterview = require('../models/OfflineInterview');
const InterviewLocation = require('../models/InterviewLocation');
const Candidate = require('../models/Candidate');
const Interviewer = require('../models/Interviewer');
const { sendInterviewEmail } = require('../services/emailService');
const mongoose = require('mongoose');

exports.scheduleInterview = async (req, res) => {
    try {
        const { candidate, interviewers, date, startTime, duration, location, round, notes, scheduledBy, emailDetails } = req.body;

        if (!mongoose.Types.ObjectId.isValid(candidate)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        for (const interviewerId of interviewers) {
            if (!mongoose.Types.ObjectId.isValid(interviewerId)) {
                return res.status(400).json({ error: 'Invalid interviewer ID format' });
            }
        }

        const candidateExists = await Candidate.findById(candidate);
        if (!candidateExists) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const interviewersExist = await Interviewer.find({ _id: { $in: interviewers } });
        if (interviewersExist.length !== interviewers.length) {
            return res.status(404).json({ error: 'One or more interviewers not found' });
        }
        
        const interview = new OfflineInterview({
            candidate,
            interviewers,
            date,
            startTime,
            duration,
            location,
            round,
            notes,
            emailDetails,
            scheduledBy
        });

        await interview.save();

        if (emailDetails) {
            try {
                if (candidateExists.email) {
                    console.log(`Attempting to send email to candidate: ${candidateExists.email}`);
                    await sendInterviewEmail(
                        candidateExists.email,
                        emailDetails.subject,
                        emailDetails.body,
                        null 
                    );
                    console.log(`Email sent to candidate: ${candidateExists.email}`);
                }

                await Promise.all(
                    interviewersExist.map(async (interviewer) => {
                        if (interviewer.email) {
                            console.log(`Attempting to send email to interviewer: ${interviewer.email}`);
                            await sendInterviewEmail(
                                interviewer.email,  
                                emailDetails.subject,
                                emailDetails.body,
                                null
                            );
                            console.log(`Email sent to interviewer: ${interviewer.email}`);
                        }
                    })
                );
            } catch (emailError) {
                console.error('Email sending failed with details:', {
                    error: emailError.message,
                    stack: emailError.stack
                });
            }
        }

        res.status(201).json({
            success: true,
            data: interview,
            message: 'Interview scheduled successfully'
        });

    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};


exports.getScheduledInterviews = async (req, res) => {
    try {
        const interviews = await OfflineInterview.find()
            .populate('candidate', 'name email') 
            .populate('interviewers', 'name email') 
            .populate('location') 
            .sort({ date: -1 }); 

        res.status(200).json({
            success: true,
            data: interviews
        });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};




exports.getLocations = async (req, res) => {
    try {
        const locations = await InterviewLocation.find({ active: true });
        res.json(locations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getRounds = async (req, res) => {
    const rounds = [
        { value: 'ROUND1', label: 'Technical Round 1' },
        { value: 'ROUND2', label: 'Technical Round 2' },
        { value: 'ROUND3', label: 'Managerial Round' },
        { value: 'HR', label: 'HR Round' }
    ];
    res.json(rounds);
};