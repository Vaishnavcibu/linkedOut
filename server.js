/* server.js (Final Corrected Version) */

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware

app.use('/public', express.static(path.join(__dirname, 'public')));
// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./src/routes/auth');
const jobRoutes = require('./src/routes/jobs');
const userRoutes = require('./src/routes/users'); // New user routes

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes); // Use user routes

// --- PAGE SERVING ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'register.html')));

// Protected Page Routes (We will create an auth middleware for pages later if needed)
app.get('/feed', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'feed.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'profile.html')));

// New Company-Specific Routes
app.get('/company-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'company-dashboard.html')));
app.get('/post-job', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'post-job.html')));
app.get('/edit-job/:id', (req, res) => res.sendFile(path.join(__dirname, 'src', 'views', 'edit-job.html')));
app.get('/job-details/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'job-details.html'));
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});