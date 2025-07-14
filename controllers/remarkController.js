const Remark = require('../models/Remark');
const Candidate = require('../models/Candidate');

exports.createRemark = async (req, res) => {
  const { candidateId, text } = req.body;
  if (!text || !candidateId) {
    return res.status(400).json({ error: 'Candidate ID and text are required' });
  }

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const remark = new Remark({ text, candidate: candidateId });
    await remark.save();
    res.status(201).json({ message: 'Remark saved', remark });
  } catch (err) {
    console.error('Create Remark Error:', err);
    res.status(500).json({ error: 'Failed to save remark' });
  }
};

exports.getRemarks = async (req, res) => {
  try {
    const remarks = await Remark.find().populate('candidate').sort({ createdAt: -1 });
    res.json(remarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch remarks' });
  }
};

exports.getRemarksByCandidate = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const remarks = await Remark.find({ candidate: candidateId }).sort({ createdAt: -1 });
    res.json(remarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch remarks for candidate' });
  }
};

exports.updateRemark = async (req, res) => {
  const { text } = req.body;
  try {
    const remark = await Remark.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    );
    if (!remark) return res.status(404).json({ error: 'Remark not found' });
    res.json({ message: 'Remark updated', remark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update remark' });
  }
};

exports.deleteRemark = async (req, res) => {
  try {
    const remark = await Remark.findByIdAndDelete(req.params.id);
    if (!remark) return res.status(404).json({ error: 'Remark not found' });
    res.json({ message: 'Remark deleted', remark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete remark' });
  }
};
