
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const candidateStageSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    stage: String,
    comments: [commentSchema]
});

module.exports = mongoose.model('CandidateStage', candidateStageSchema, 'candidates');
