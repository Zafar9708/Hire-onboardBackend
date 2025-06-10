

const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['Sourced', 'Screening', 'Interview', 'Preboarding', 'Hired', 'Archived'], 
    default: 'Sourced' 
  },
  source: { type: String, enum: ['LinkedIn', 'Naukari', 'Via Email'], required: true },
  availableToJoin: Number,
  currentLocation: { type: String, enum: ['Mumbai', 'Gurgaon', 'Delhi', 'Bengaluru', 'Pune'] },
  preferredLocation: { type: String, enum: ['Mumbai', 'Gurgaon', 'Delhi', 'Bengaluru', 'Pune'] },
  gender: { type: String, enum: ['Male', 'Female'] },
  dob: Date,
  owner: { type: String, enum: ['Himanshu Patel', 'Preeti Kashyap', 'Richa Kumari'] },
  skills: [String],
  experience: String,
  education: String,
  resume: {
    path: String,
    originalName: String
  },
  additionalDocuments: [{
    path: String,
    originalName: String
  }],
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ,
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }
});

module.exports = mongoose.model('Candidate', candidateSchema);


