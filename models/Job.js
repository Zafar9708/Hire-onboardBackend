
// const mongoose = require('mongoose');
// const { departments } = require('../utils/departments');

// const jobSchema = new mongoose.Schema({
//     jobTitle: {
//         type: String,
//         required: true
//     },
//     department: {
//         type: String,
//         enum: departments,
//         required: true
//     },
//     experience: {
//         type: String,
//         required: true
//     },
//     jobDesc: {
//         type: String,
//         required: true
//     },
//     jobFormId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'JobForm'
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Users'
//     }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Job', jobSchema);


//---------------

const mongoose = require('mongoose');
const { departments } = require('../utils/departments');


const jobSchema = new mongoose.Schema({
    jobName: { type: String, required: true, unique: true },
    jobTitle: { type: String, required: true },
    department: {
        type: String,
        enum: departments,
        required: true
    }, 
    experience: { type: String, required: true },
    jobDesc: { type: String, required: true },
    status: { type: String, default: 'Active', enum: ['Active', 'On Hold', 'Closed Own', 'Closed Lost','Archived'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobForm' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);