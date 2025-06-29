// // routes/stageRoutes.js
// const express = require('express');
// const router = express.Router();
// const Stage = require('../models/Stages');
// const { stages: stageOptions } = require('../utils/stages');


// router.get('/all', async (req, res) => {
//     const stageDocs = await Stage.find().sort({ name: 1 });
//     res.json(stageDocs);
//   });

// router.get('/options', (req, res) => {
//   res.json(stageOptions);
// });

// module.exports = router;

//----
// routes/stageRoutes.js
const express = require('express');
const router = express.Router();
const Stage = require('../models/Stages');
const { stages: stageOptions, rejectionTypes } = require('../utils/stages');

router.get('/all', async (req, res) => {
  const stageDocs = await Stage.find().sort({ order: 1 });
  res.json(stageDocs);
});

router.get('/options', (req, res) => {
  res.json(stageOptions);
});

router.get('/rejection-types', (req, res) => {
  res.json(rejectionTypes);
});

router.post('/rejection-types',  async (req, res) => {
    try {
        const { type } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Rejection type is required' });
        }
        const stage = await Stage.findOneAndUpdate(
            { name: "Rejected" },
            { $addToSet: { rejectionTypes: type } },
            { new: true, upsert: true }
        );

        res.status(201).json(stage.rejectionTypes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add rejection type' });
    }
});

module.exports = router;