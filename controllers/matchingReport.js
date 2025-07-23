const { calculateMatchScore } = require('../services/matchingService');
const Job = require('../models/Job'); 


exports.evaluateResumeMatch = async (req, res) => {
  try {
    const { resumeId, jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const matchResult = await calculateMatchScore(resumeId, job);
    
    res.json({
      success: true,
      matchResult
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate resume match'
    });
  }
};

exports.processAutomaticScreening = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate('stages');
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Find interview stage (assuming it's the second stage)
    const interviewStage = job.stages && job.stages.length >= 2 ? job.stages[1] : null;
    if (!interviewStage) {
      return res.status(400).json({
        success: false,
        error: 'Interview stage not configured for this job'
      });
    }

    // Find all candidates for this job with resumes
    const candidates = await Candidate.find({ jobId }).populate('resume');
    
    let processed = 0;
    let movedToInterview = 0;
    const results = [];

    for (const candidate of candidates) {
      if (!candidate.resume) continue;
      
      processed++;
      const matchResult = await calculateMatchScore(candidate.resume._id, job);
      results.push({
        candidateId: candidate._id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        ...matchResult
      });

      // If match is 75% or higher, move to interview stage
      if (matchResult.score >= 75) {
        candidate.stage = interviewStage._id;
        candidate.comments.push({
          text: `Automatically moved to interview stage due to high resume match (${matchResult.score}%)`,
          changedAt: new Date(),
          stageChangedFrom: candidate.stage?.name || 'Screening',
          stageChangedTo: interviewStage.name
        });
        await candidate.save();
        movedToInterview++;
      }
    }

    res.json({
      success: true,
      message: `Processed ${processed} candidates, moved ${movedToInterview} to interview stage`,
      results
    });
  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process automatic screening'
    });
  }
};


exports.matchingReport=async(req,res)=> {
  try {
    const { jobId, candidateId } = req.query;
    const query = {};
    if (jobId) query.jobId = jobId;
    if (candidateId) query.candidateId = candidateId;
    
    const reports = await MatchingReport.find(query)
      .populate('jobId', 'jobTitle')
      .populate('candidateId', 'firstName lastName');
    
    res.json({
      success: true,
      reports: reports.map(r => ({
        ...r.toObject(),
        candidateName: r.candidateId ? `${r.candidateId.firstName} ${r.candidateId.lastName}` : 'Unknown'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};