const express = require('express');
const router = express.Router();
const Remark = require('../models/Remark');

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const remark = new Remark({ text });
    await remark.save();
    res.status(201).json({ message: 'Remark saved', remark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save remark' });
  }
});

router.get('/', async (req, res) => {
  try {
    const remarks = await Remark.find().sort({ createdAt: -1 });
    res.json(remarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch remarks' });
  }
});

router.put('/:id', async (req, res) => {
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
});


router.delete('/:id', async (req, res) => {
  try {
    const remark = await Remark.findByIdAndDelete(req.params.id);
    if (!remark) return res.status(404).json({ error: 'Remark not found' });
    res.json({ message: 'Remark deleted', remark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete remark' });
  }
});

module.exports = router;
