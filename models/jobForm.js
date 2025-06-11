

const mongoose = require('mongoose');

const jobFormSchema = new mongoose.Schema({
    jobType: { type: String, required: true },
    location: { type: String, required: true },
    openings: { type: Number, required: true },
    targetHireDate: { type: Date, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    allowReapply: { type: Boolean, default: false },
    reapplyDate: { type: Number },
    markPriority: { type: Boolean, default: false },
    hiringFlow: { type: Array, default: [] },
    BusinessUnit: { type: String, required: true, enum: ['internal', 'external'] },
    Client: { type: String },
    recruiters: [{
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    }],
    salesPerson: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobForm', jobFormSchema);
