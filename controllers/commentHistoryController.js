const Candidate = require('../models/Candidate');

exports.getCandidateComments = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const comments = candidate.comments?.map(comment => ({
      text: comment.text,
      date: comment.date || comment.changedAt, 
    })) || [];

    res.json({ comments });
  } catch (err) {
    console.error('Error fetching candidate comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
