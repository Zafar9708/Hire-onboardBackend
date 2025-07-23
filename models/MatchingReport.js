const mongoose = require('mongoose');

const matchingReportSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  details: {
    skills: {
      match: Number,
      resume: [String],
      required: [String]
    },
    experience: {
      match: Number,
      resume: String,
      required: String
    },
    education: {
      match: Number,
      resume: String,
      required: String
    }
  },
  decision: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MatchingReport', matchingReportSchema);