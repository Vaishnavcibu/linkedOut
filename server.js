/* server.js (Final Corrected Version) */

// --- 1. IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// --- 2. INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- 4. MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, client-side JS) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));


// --- 5. API ROUTES ---
const authRoutes = require('./src/routes/auth');
const jobRoutes = require('./src/routes/jobs');

app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);


// --- 6. PAGE SERVING ROUTES (The Fix) ---
// This section defines the clean URLs for your application's pages.

// Route for the home page ('/' or '/index')
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
});
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
});

// Route for the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'login.html'));
});

// Route for the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'register.html'));
});

// Route for the job feed
app.get('/feed', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'feed.html'));
});

// Route for the profile page
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'profile.html'));
});


// --- 7. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});