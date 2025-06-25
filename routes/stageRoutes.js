// routes/stageRoutes.js
const express = require('express');
const router = express.Router();
const Stage = require('../models/Stages');
const { stages: stageOptions } = require('../utils/stages');


router.get('/all', async (req, res) => {
    const stageDocs = await Stage.find().sort({ name: 1 });
    res.json(stageDocs);
  });

router.get('/options', (req, res) => {
  res.json(stageOptions);
});

module.exports = router;
