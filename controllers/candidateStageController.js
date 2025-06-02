
const CandidateStage = require('../models/CandidateStage');

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


