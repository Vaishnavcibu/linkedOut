/* src/routes/users.js (New File) */
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder to store resumes
    },
    filename: function (req, file, cb) {
        // Create a unique filename: user_id-timestamp.pdf
        const uniqueSuffix = req.user._id + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        if(path.extname(file.originalname) !== '.pdf'){
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});


// --- GET CURRENT USER PROFILE ---
// Endpoint: GET /api/users/me
router.get('/me', auth, async (req, res) => {
    // req.user is attached by the auth middleware
    res.status(200).json({ user: req.user });
});

// --- UPDATE USER PROFILE ---
// Endpoint: POST /api/users/profile
// Now handles both data and resume upload
router.post('/profile', auth, upload.single('resume'), async (req, res) => {
    const { name, email, skills } = req.body;

    const skillsArray = skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [];

    const updates = {
        name,
        email,
        skills: skillsArray
    };

    // If a new resume file was uploaded, add its path to the updates
    if (req.file) {
        updates.resumeUrl = req.file.path;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, // User ID from auth middleware
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
});


module.exports = router;