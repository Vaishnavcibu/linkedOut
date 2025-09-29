/* src/models/user.js */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Full name is required.'],
        trim: true // Removes whitespace from both ends
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true, // Ensures no two users can have the same email
        lowercase: true, // Converts email to lowercase before saving
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: [8, 'Password must be at least 8 characters long.']
        // Note: In a real app, you would hash this password before saving!
        // We will not select the password by default in queries.
        // select: false 
    },
    userType: {
        type: String,
        enum: ['student', 'recruiter'],
        default: 'student',
        required: true
    },
    skills: {
        type: [String], // An array of strings
        default: []
    },
    resumeUrl: {
        type: String, // URL to a stored resume file (e.g., on a cloud service)
        default: ''
    },
    appliedJobs: [{
        type: Schema.Types.ObjectId, // An array of references to Job documents
        ref: 'Job'
    }],
    rejectedJobs: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }]
}, {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true
});

// Create the model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User;