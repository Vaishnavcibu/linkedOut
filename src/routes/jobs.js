/* src/routes/jobs.js (Final Corrected Version) */
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { generateApplicationCoverLetter } = require('../utils/aiHelper');


// --- GET JOB FEED (FOR STUDENTS) ---
router.get('/feed', auth, async (req, res) => {
    try {
        const user = req.user;
        const seenJobs = [...user.appliedJobs, ...user.rejectedJobs];

        const jobs = await Job.find({
            skillsRequired: { $in: user.skills },
            _id: { $nin: seenJobs }
        }).sort({ createdAt: -1 }).limit(20);

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching job feed:', error);
        res.status(500).json({ message: 'Server error while fetching jobs.' });
    }
});

// --- HANDLE SWIPE ACTION ---
router.post('/swipe/:jobId/:direction', auth, async (req, res) => {
    const { jobId, direction } = req.params;

    if (direction !== 'right' && direction !== 'left') {
        return res.status(400).json({ message: 'Invalid swipe direction specified.' });
    }
    try {
        if (direction === 'right') {
            const user = req.user; // User from auth middleware
            const job = await Job.findById(jobId);

            if (user && job && user.resumeUrl) { // Only trigger AI if resume exists
                console.log('🚀 AI application process triggered...');
                const coverLetter = await generateApplicationCoverLetter(user, job);
                console.log(`\n--- AI Generated Cover Letter for ${user.name} ---`);
                console.log(coverLetter);
                console.log('--- End of AI Generated Content ---\n');
            }
        }
        const updateField = direction === 'right' ? 'appliedJobs' : 'rejectedJobs';
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { [updateField]: jobId }
        });
        res.status(200).json({ message: `Successfully recorded swipe ${direction}` });
    } catch (error) {
        console.error('Error processing swipe:', error);
        res.status(500).json({ message: 'Server error while processing swipe.' });
    }
});


// === COMPANY JOB MANAGEMENT (CRUD) ===

// --- GET ALL JOBS POSTED BY A COMPANY ---
router.get('/my-jobs', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- POST A NEW JOB ---
router.post('/post', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Only recruiters can post jobs.' });
    }
    try {
        const { title, company, location, jobType, description, skillsRequired, salary } = req.body;
        const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);

        const newJob = new Job({
            ...req.body,
            skillsRequired: skillsArray,
            postedBy: req.user._id // Set the poster to the logged-in user
        });
        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', job: newJob });
    } catch (error) {
        res.status(500).json({ message: 'Server error while posting job.' });
    }
});

// --- GET A SINGLE JOB FOR EDITING ---
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// --- UPDATE A JOB ---
router.put('/:id', auth, async (req, res) => {
     if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const { skillsRequired, ...otherUpdates } = req.body;
        const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
        const updates = { ...otherUpdates, skillsRequired: skillsArray };

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, postedBy: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }
        res.status(200).json({ message: 'Job updated successfully!', job });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- DELETE A JOB ---
router.delete('/:id', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized.' });
        }
        res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// --- GET JOB DETAILS AND APPLICANTS (FOR COMPANIES) ---
// Endpoint: GET /api/jobs/:id/details
router.get('/:id/details', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const jobId = req.params.id;

        // 1. Find the job and verify ownership
        const job = await Job.findById(jobId);
        if (!job || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Job not found or you are not authorized.' });
        }

        // 2. Find all users who have applied to this job
        const applicants = await User.find({ appliedJobs: jobId }).select('name email skills resumeUrl');

        // 3. Send back both the job and the applicants
        res.status(200).json({
            job,
            applicants,
            applicationCount: applicants.length
        });
    } catch (error) {
        console.error('Error fetching job details and applicants:', error);
        res.status(500).json({ message: 'Server error while fetching job details.' });
    }
});


module.exports = router;