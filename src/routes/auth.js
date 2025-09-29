/* src/routes/auth.js */

const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model

// --- REGISTRATION ROUTE ---
// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    // Destructure the required fields from the request body
    const { name, email, password, userType } = req.body;

    // Basic validation
    if (!name || !email || !password || !userType) {
        // In a real app, you might render an error on the page
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // 1. Check if a user with this email already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        // 2. (IMPORTANT) In a real app, hash the password here!
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create a new user instance
        const newUser = new User({
            name,
            email,
            password, // In production, use hashedPassword
            userType
        });

        // 4. Save the new user to the database
        await newUser.save();

        // 5. Registration successful
        // In a real app, you would create a session or JWT token here
        // For now, we will just redirect to the login page with a success message
        // res.redirect('/login.html?status=success'); // This doesn't work well for APIs
        res.status(201).json({ message: 'User registered successfully! Please log in.' });

    } catch (error) {
        console.error('Registration error:', error);
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// --- LOGIN ROUTE ---
// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // 1. Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. User not found.' });
        }

        // 2. (IMPORTANT) In a real app, compare the hashed password
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) { ... }

        // 3. Compare the plain text password (for this project only)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
        }

        // 4. Login successful
        // In a real app, create a session or JWT token
        // For now, we'll redirect to the feed
        res.redirect('/feed');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;