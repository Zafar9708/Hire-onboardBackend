const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');


const {
  createNote,
  getNotesByJob,
  deleteNote,
  updateNote
} = require('../controllers/noteController');

router.post('/:jobId', protect, createNote);      // Create note
router.get('/:jobId', protect, getNotesByJob);    // Get notes for a job
router.delete('/:noteId', protect, deleteNote); 
router.put('/:noteId', protect, updateNote);

module.exports = router;
