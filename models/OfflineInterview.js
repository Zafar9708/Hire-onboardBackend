const mongoose = require('mongoose');

const offlineInterviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  interviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interviewer',
    required: true
  }],
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  location: {
    address: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
  },
  round: {
    type: String,
    enum: ['ROUND1', 'ROUND2', 'ROUND3', 'HR'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledBy: { type: String, required: true },

  notes: String,

  emailDetails: {
    subject: String,
    body: String
  }
}, { timestamps: true });

module.exports = mongoose.model('OfflineInterview', offlineInterviewSchema);