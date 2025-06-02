const mongoose = require('mongoose');

const jobStatusSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Closed Own', 'Closed Lost'],
    default: 'Active'
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('JobStatus', jobStatusSchema);