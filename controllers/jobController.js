const templates = require('../data/templates.json'); 
const Counter = require('../models/Counter');
const Job = require('../models/Job');
const JobForm = require('../models/jobForm');

const getJobTemplates = (req, res) => {
  try {
    console.log('📦 Templates loaded:', templates);
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job templates.' });
  }
};

const postJob = async (req, res) => {
    try {
        const { jobTitle, department, experience, jobDesc } = req.body;

        const counter = await Counter.findByIdAndUpdate(
            { _id: 'jobNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const jobName = `WR${String(counter.seq).padStart(2, '0')}`;

        const job = new Job({ 
            jobName,
            jobTitle, 
            department, 
            experience, 
            jobDesc, 
            userId: req.user._id 
        });
        const savedJob = await job.save();

        const {
            jobType, location, openings, targetHireDate, currency,
            amount, allowReapply, reapplyDate, markPriority, hiringFlow,
            BusinessUnit, Client
        } = req.body;

        if (BusinessUnit === 'external' && !Client) {
            return res.status(400).json({ error: "Client is required when BusinessUnit is external" });
        }

        const jobForm = new JobForm({
            jobType,
            location,
            openings,
            targetHireDate,
            currency,
            amount,
            allowReapply,
            reapplyDate,
            markPriority,
            hiringFlow,
            BusinessUnit,
            Client: BusinessUnit === 'external' ? Client : undefined
        });

        const savedJobForm = await jobForm.save();

        savedJob.jobFormId = savedJobForm._id;
        await savedJob.save();

        res.status(201).json({
            message: 'Job and JobForm created successfully',
            job: savedJob,
            jobForm: savedJobForm,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to create job and jobForm' });
    }
}

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('jobFormId');

        if (!jobs || jobs.length === 0) {
            return res.status(400).json({ msg: 'No jobs found',jobs:[] });
        }

        res.status(200).json({
            message: 'Jobs and associated JobForms fetched successfully',
            jobs,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
    }
}
const getAllJobsByStatus = async (req, res) => {
    try {
        const {status} = req.params

        const query ={
          status:status
        }
        const jobs = await Job.find(query).populate('jobFormId');

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ error: 'No jobs found' });
        }

        res.status(200).json({
            message: 'Jobs and associated JobForms fetched successfully',
            jobs,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
    }
}

const getJobDetailById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate('jobFormId');

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({
            message: 'Job and associated JobForm fetched successfully',
            job,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to fetch job and jobForm' });
    }
}

const changeJobStatusById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['Active', 'On Hold', 'Closed Won', 'Closed Lost', 'Archived']; // Added 'Archived'
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        const job = await Job.findOne({ _id: jobId });
        if (!job) {
            return res.status(404).json({ error: 'Job not found or unauthorized' });
        }

        if (status) {
            job.status = status;
        }
        
        const updatedJob = await job.save();

        res.status(200).json({
            message: 'Job status updated successfully',
            job: updatedJob
        });
    } catch (error) {
        console.error('🔥 Error updating job status:', error);
        res.status(500).json({ error: 'Failed to update job status' });
    }
}

module.exports = {
  getJobTemplates,
  postJob,
  getAllJobs,
  getAllJobsByStatus,
  getJobDetailById,
  changeJobStatusById
};
