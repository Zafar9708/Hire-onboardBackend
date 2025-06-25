// scripts/seedStages.js
const mongoose = require('mongoose');
const Stage = require('../models/Stages');
const { stages } = require('../utils/stages'); // ✅ FIXED HERE

const MONGO_URI = 'mongodb+srv://zafarekhlaque9708:93045@hireonboard.brlsozu.mongodb.net/?retryWrites=true&w=majority&appName=HireOnboard'; 

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  insertStages();
}).catch((err) => {
  console.error('❌ DB connection error:', err);
});

async function insertStages() {
  try {
    for (const name of stages) {
      await Stage.findOneAndUpdate(
        { name },
        { name },
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
