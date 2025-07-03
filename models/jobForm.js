


// const mongoose = require('mongoose');

// const jobFormSchema = new mongoose.Schema({
//     jobType: { type: String, required: true },
//     location: { type: String, required: true },
//     openings: { type: Number, required: true },
//     targetHireDate: { type: Date, required: true },
//     currency: { type: String, required: true },
//     amount: { type: Number, required: true },
//     allowReapply: { type: Boolean, default: false },
//     reapplyDate: { type: Number, default: null },
//     markPriority: { type: Boolean, default: false },
//     hiringFlow: { type: [String], default: [] },
//     salesPerson: {
//         type: String,
//         default: ''
//     },

//     recruitingPerson: {
//         type: [String], 
//         default: []
//     },
//     BusinessUnit: {
//         type: String,
//         enum: ['internal', 'external'],
//         required: true
//     },

//     Client: {
//         type: String,
//         required: function () {
//             return this.BusinessUnit === 'external';
//         }
//     }
// });

// module.exports = mongoose.model('JobForm', jobFormSchema);


//-----------




const mongoose = require('mongoose');

const jobFormSchema = new mongoose.Schema({
    jobType: { type: String, required: true },
    location: { type: String, required: true },
    openings: { type: Number, required: true },
    targetHireDate: { type: Date, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    allowReapply: { type: Boolean, default: false },
    reapplyDate: { type: Number, default: null },
    markPriority: { type: Boolean, default: false },
    hiringFlow: { type: [String], default: [] },
    salesPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee',
        default: null
    },

    recruitingPerson: {
        type: [String], 
        default: []
    },
    BusinessUnit: {
        type: String,
        enum: ['internal', 'external'],
        required: true
    },

    Client: {
        type: String,
        enum:['Vimo','Wipro','infosys',''],
        required: function () {
            return this.BusinessUnit === 'external';
        }
    }
});

module.exports = mongoose.model('JobForm', jobFormSchema);
