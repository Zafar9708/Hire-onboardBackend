const CandidateNote = require('../models/CandidateNote');
const Candidate = require('../models/Candidate');

// Create a new note
exports.createNote = async (req, res) => {
  const { candidateId, note } = req.body;

  if (!note || !candidateId) {
    return res.status(400).json({ error: 'Candidate ID and note are required' });
  }

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const newNote = await CandidateNote.create({
      candidate: candidateId,
      note
    });

    res.status(201).json({ message: 'Note created', note: newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await CandidateNote.find().populate('candidate').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// Get notes by candidate ID
exports.getNotesByCandidate = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const notes = await CandidateNote.find({ candidate: candidateId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes for candidate' });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const updated = await CandidateNote.findByIdAndUpdate(
      id,
      { note },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Note updated', note: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const deleted = await CandidateNote.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Note deleted', note: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
