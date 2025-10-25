/* src/routes/auth.js (Final Corrected Version) */
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    const { name, email, password, userType } = req.body;
    if (!name || !email || !password || !userType) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            userType
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully! Please log in.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            _id: user._id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });

        res.cookie('token', token, {
            httpOnly: true, // The cookie is not accessible via client-side JS
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: 'Login successful!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- LOGOUT ROUTE ---
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful.' });
});

// --- CHECK AUTH STATUS ---
// A route to check if a user is logged in
router.get('/me', async (req, res) => {
     try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Not authenticated' });
    }
});


module.exports = router;