/* src/models/user.js */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Full name is required.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
        select: false // Exclude password from query results by default
    },
    userType: {
        type: String,
        enum: ['student', 'recruiter'],
        default: 'student',
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    resumeUrl: { // Stores the path to the uploaded resume file
        type: String,
        default: ''
    },
    appliedJobs: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }],
    rejectedJobs: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }]
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);
module.exports = User;