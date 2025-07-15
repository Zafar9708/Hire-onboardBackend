const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNotesByCandidate,
  updateNote,
  deleteNote
} = require('../controllers/candidateNoteController');

router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/candidate/:candidateId', getNotesByCandidate);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
