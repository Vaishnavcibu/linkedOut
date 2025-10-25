/* src/models/job.js */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Job title is required.'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required.'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required.'],
        default: 'Remote'
    },
    jobType: {
        type: String,
        enum: ['internship', 'full-time', 'part-time', 'volunteer'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required.'],
        maxlength: [1000, 'Description cannot be more than 1000 characters.']
    },
    skillsRequired: {
        type: [String],
        default: [],
        required: true
    },
    salary: {
        // A flexible field to store salary, stipend, or benefits info
        value: { type: Number },
        currency: { type: String, default: 'USD' },
        period: { type: String, enum: ['hour', 'month', 'year'], default: 'year' },
        details: { type: String, trim: true } // e.g., "Unpaid", "$7,500/month stipend"
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the 'recruiter' user who posted the job
        required: true
    }
}, {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true
});

// Create the model from the schema
const Job = mongoose.model('Job', JobSchema);

module.exports = Job;