/* src/routes/jobs.js (Corrected Imports and Full Code) */
const express = require('express');
const router = express.Router();

// --- CORRECTED MODEL & MIDDLEWARE IMPORTS ---
// Each model must be required from its specific file.
const Job = require('../models/job');
const User = require('../models/user');
const Application = require('../models/application');
const auth = require('../middleware/auth');
const { generateApplicationCoverLetter } = require('../utils/aiHelper');


// ===========================================
// --- STUDENT / JOB SEEKER ROUTES ---
// ===========================================

/**
 * @route   GET /api/jobs/feed
 * @desc    Get a personalized list of jobs for the logged-in student/job seeker.
 * @access  Private
 */
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


/**
 * @route   POST /api/jobs/swipe/:jobId/:direction
 * @desc    Record a user's swipe action and trigger AI application on 'right' swipe.
 * @access  Private
 */
router.post('/swipe/:jobId/:direction', auth, async (req, res) => {
    const { jobId, direction } = req.params;

    if (direction !== 'right' && direction !== 'left') {
        return res.status(400).json({ message: 'Invalid swipe direction specified.' });
    }

    try {
        if (direction === 'right') {
            const user = req.user;
            const job = await Job.findById(jobId);

            if (user && job && user.resumeUrl) {
                console.log(`🚀 AI application process triggered for user ${user._id}...`);
                const coverLetter = await generateApplicationCoverLetter(user, job);
                
                const newApplication = new Application({
                    job: jobId,
                    applicant: user._id,
                    coverLetter: coverLetter
                });
                await newApplication.save();
                console.log(`✅ Application from ${user.name} for ${job.title} saved to database.`);
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


// ===============================================
// --- COMPANY / RECRUITER ROUTES (JOB CRUD) ---
// ===============================================

/**
 * @route   GET /api/jobs/my-jobs
 * @desc    Get all jobs posted by the logged-in recruiter.
 * @access  Private (Recruiter only)
 */
router.get('/my-jobs', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied. Only recruiters can view their jobs.' });
    }
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching jobs.' });
    }
});


/**
 * @route   GET /api/jobs/:id/details
 * @desc    Get details of a single job and a list of all applicants.
 * @access  Private (Recruiter who posted the job only)
 */
router.get('/:id/details', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Job not found or you are not authorized.' });
        }

        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email skills resumeUrl');

        res.status(200).json({
            job,
            applications,
            applicationCount: applications.length
        });
    } catch (error) {
        console.error('Error fetching job details and applicants:', error);
        res.status(500).json({ message: 'Server error while fetching job details.' });
    }
});


/**
 * @route   POST /api/jobs/post
 * @desc    Create a new job posting.
 * @access  Private (Recruiter only)
 */
router.post('/post', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied. Only recruiters can post jobs.' });
    }
    try {
        const { skillsRequired, ...jobData } = req.body;
        const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);

        const newJob = new Job({
            ...jobData,
            skillsRequired: skillsArray,
            postedBy: req.user._id
        });
        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', job: newJob });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Server error while posting job.' });
    }
});


/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job's data for the edit form.
 * @access  Private (Recruiter who posted the job only)
 */
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


/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job posting.
 * @access  Private (Recruiter who posted the job only)
 */
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
            return res.status(404).json({ message: 'Job not found or unauthorized to edit.' });
        }
        res.status(200).json({ message: 'Job updated successfully!', job });
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating job.' });
    }
});


/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job posting.
 * @access  Private (Recruiter who posted the job only)
 */
router.delete('/:id', auth, async (req, res) => {
    if (req.user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });

        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized to delete.' });
        }
        
        await Application.deleteMany({ job: req.params.id });

        res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting job.' });
    }
});


module.exports = router;