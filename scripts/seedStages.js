const mongoose = require('mongoose');
const Stage = require('../models/Stages');
const { stages, rejectionTypes } = require('../utils/stages');

const MONGO_URI = 'mongodb://localhost:27017/hire';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    insertStages();
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);
  });

async function insertStages() {
  try {
    for (let i = 0; i < stages.length; i++) {
      const name = stages[i];

      await Stage.findOneAndUpdate(
        { name },
        {
          name,
          order: i + 1,
          rejectionTypes, // optional, or keep default
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('✅ All stages inserted/updated successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error inserting stages:', error);
    mongoose.disconnect();
  }
}
