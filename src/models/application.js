/* src/models/application.js (New File) */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'viewed', 'interviewing', 'rejected', 'hired'],
        default: 'applied'
    }
}, {
    timestamps: true
});

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;