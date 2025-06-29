// // models/Stage.js
// const mongoose = require('mongoose');
// const { stages } = require('../utils/stages');

// const stageSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     enum: stages,
//     required: true,
//     unique: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Stage', stageSchema);

//--------------


// models/Stage.js
const mongoose = require('mongoose');
const { stages } = require('../utils/stages');

const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: stages,
    required: true,
    unique: true
  },
  rejectionTypes: {
    type: [String],
    default: ["R1 Rejected", "R2 Rejected", "Client Rejected"]
  },
  order: {
    type: Number,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Stage', stageSchema);
