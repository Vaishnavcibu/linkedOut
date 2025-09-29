/* server.js */

// --- 1. IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // To use environment variables from a .env file

// --- 2. INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// --- 4. MIDDLEWARE ---

// Body Parsers: To handle JSON and URL-encoded data from forms and AJAX
app.use(express.json()); // For parsing application/json (used by AJAX in profile.html)
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded (used by login/register forms)

// Static File Server: Serve all files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));


// --- 5. API ROUTES ---
const authRoutes = require('./src/routes/auth');
const jobRoutes = require('./src/routes/jobs');

app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth
app.use('/api', jobRoutes);      // Mount job/user routes under /api


// --- 6. HTML PAGE SERVING ROUTES ---
// Serve the main pages directly from the /src/views directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'register.html'));
});

app.get('/feed.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'feed.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'profile.html'));
});


// --- 7. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});