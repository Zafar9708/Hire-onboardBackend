
const CandidateStage = require('../models/CandidateStage');
const Candidate=require('../models/Candidate')
const mongoose = require('mongoose');


exports.getCandidate = async (req, res) => {
    try {
        const candidate = await CandidateStage.findById(req.params.id);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.moveCandidate = async (req, res) => {
    const { newStage, comment } = req.body;
    try {
        const candidate = await CandidateStage.findById(req.params.id);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        candidate.stage = newStage;
        if (comment) {
            candidate.comments.push({ text: comment });
        }

        await candidate.save();
        res.json({ message: 'Candidate moved successfully', candidate });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllCandidateStatus=async(req,res)=>{
    const candidate=await CandidateStage.find(req.params.id)
    if(!candidate){
        return res.status(404).json({
            success:false,
            message:"No Candidate found with stage"
        })

    }
    return res.status(200).json({
        success:true,
        message:"Candidates Stages Found"
    })

}



exports.getStageByJobId = async (req, res) => {
    try {
      const jobObjectId = new mongoose.Types.ObjectId(req.params.jobId);
  
      const candidates = await Candidate.find({ jobId: jobObjectId })
        .populate('stage', 'name')
        .populate('jobId', 'jobTitle');
  
      if (!candidates || candidates.length === 0) {
        return res.status(404).json({ error: 'No candidates found for this job' });
      }
  
      const result = candidates.map(candidate => ({
        candidateId: candidate._id,
        name: `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim(),
        stage: candidate.stage,
        job: candidate.jobId
      }));
  
      res.json({ candidates: result });
    } catch (error) {
      console.error('Error fetching candidates by jobId:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
