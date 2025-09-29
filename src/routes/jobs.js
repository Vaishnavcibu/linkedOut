/* src/routes/jobs.js */

const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const User = require('../models/user');

// --- GET JOB FEED ---
// Endpoint: GET /api/jobs/feed
// Description: Fetches a list of jobs for the user's feed.
// Note: A real implementation would filter jobs based on the user's profile.
router.get('/feed', async (req, res) => {
    try {
        // For now, fetch the 10 most recent job postings.
        // A real AI-based system would have complex logic here.
        const jobs = await Job.find({}).sort({ createdAt: -1 }).limit(10);
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching job feed:', error);
        res.status(500).json({ message: 'Server error while fetching jobs.' });
    }
});

// --- HANDLE SWIPE ACTION ---
// Endpoint: POST /api/jobs/swipe/:jobId/:direction
// Description: Records a user's swipe action (right for accept, left for reject).
router.post('/swipe/:jobId/:direction', async (req, res) => {
    const { jobId, direction } = req.params;
    
    // In a real application, you would get the user ID from their session or token.
    // For this example, we'll hardcode a user ID. You'll need to create a user in your DB.
    const MOCK_USER_ID = "635f9a8d4a5b6c7d8e9f0a1b"; // Replace with a real ID from your DB

    if (direction !== 'right' && direction !== 'left') {
        return res.status(400).json({ message: 'Invalid swipe direction specified.' });
    }

    try {
        const updateField = direction === 'right' ? 'appliedJobs' : 'rejectedJobs';
        
        // Use $addToSet to add the jobId to the array only if it's not already present.
        await User.findByIdAndUpdate(MOCK_USER_ID, {
            $addToSet: { [updateField]: jobId }
        });
        
        res.status(200).json({ message: `Successfully recorded swipe ${direction} for job ${jobId}` });

    } catch (error) {
        console.error('Error processing swipe:', error);
        res.status(500).json({ message: 'Server error while processing swipe.' });
    }
});


// --- UPDATE USER PROFILE (Used by profile.html AJAX) ---
// Endpoint: POST /api/user/profile
// Description: Updates a user's profile information.
router.post('/user/profile', async (req, res) => {
    const { name, email, skills } = req.body;
    
    // Hardcoding user ID again for this example.
    const MOCK_USER_ID = "635f9a8d4a5b6c7d8e9f0a1b"; // Replace with the same user ID

    // Convert skills string to an array
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            MOCK_USER_ID,
            {
                name,
                email,
                skills: skillsArray
            },
            { new: true, runValidators: true } // Return the updated document and run schema validators
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