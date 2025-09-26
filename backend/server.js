// server.js

// 1. Import necessary packages
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// --- Gemini API Clients ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Client for Resource Recommendations (uses GEMINI_API_KEY)
const genAI_Resources = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model_Resources = genAI_Resources.getGenerativeModel({ model: "gemini-1.5-flash" });

// Client for the Chatbot (uses CHATBOT_API_KEY)
const genAI_Chatbot = new GoogleGenerativeAI(process.env.CHATBOT_API_KEY);
const model_Chatbot = genAI_Chatbot.getGenerativeModel({ model: "gemini-1.5-flash" });


// --- Load Resource Data ---
let resourcesData = {};
try {
    const filePath = path.join(__dirname, 'resources.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    resourcesData = JSON.parse(fileContent);
    console.log('Successfully loaded resources from resources.json');
} catch (error) {
    console.error('Error reading or parsing resources.json:', error);
    resourcesData = { videos: {}, audios: {} };
}

// --- HELPER FUNCTION ---
function findResourceById(id) {
    if (!id) return null;
    const type = id.startsWith('vid_') ? 'videos' : 'audios';
    const dataSet = resourcesData[type];
    for (const category in dataSet) {
        const found = dataSet[category].find(item => item.id === id);
        if (found) return found;
    }
    return null;
}

// 2. Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Path and Static File Setup ---
// Serve the main pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));
app.get('/resources', (req, res) => res.sendFile(path.join(__dirname, 'resources.html')));
app.get('/chatbot', (req, res) => res.sendFile(path.join(__dirname, 'ai_assessment.html')));


// Serve all other static files like CSS, JS, images
app.use(express.static(__dirname));

// --- API Endpoints ---

// API endpoint for User Signup
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    console.log(`New signup attempt with email: ${email}`);

    // TODO: Save the new user to a database here.
    
    // Send welcome email
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        let mailOptions = {
            from: `"MindEase" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to MindEase! 👋',
            html: `<h1>Welcome!</h1><p>Thank you for signing up. We're excited to have you on board.</p><p>We are here to support you on your journey to mental wellness.</p><br><p>Best,</p><p>The MindEase Team</p>`,
        };
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully.');
        res.status(200).json({ success: true, message: 'Registration successful! Please check your email.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Something went wrong on our end.' });
    }
});

// API endpoint for User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    console.log(`Login attempt for: ${email}`);
    
    // --- SIMULATED LOGIN ---
    // TODO: Replace this with actual database user validation
    if (email.includes('@') && password.length > 0) {
        res.status(200).json({ success: true, message: 'Login successful!' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
});


// Audio Proxy (Unchanged)
app.get('/api/audio-proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Audio URL is required');
    try {
        const response = await axios({ method: 'get', url: decodeURIComponent(url), responseType: 'stream' });
        res.setHeader('Content-Type', 'audio/mpeg');
        response.data.pipe(res);
    } catch (error) {
        console.error('Audio proxy error:', error.message);
        res.status(500).send('Failed to fetch audio file.');
    }
});


// Resource library endpoints (Unchanged)
app.get('/api/resources', (req, res) => res.json(resourcesData));


// "Brain" API for Resource Recommendations (Unchanged)
app.post('/api/brain/recommend', async (req, res) => {
    const { stressLevel } = req.body;
    if (!stressLevel) return res.status(400).json({ message: 'Stress level is required.' });
    try {
        const prompt = `You are a compassionate wellness assistant...`; // your prompt
        const result = await model_Resources.generateContent(prompt);
        // ... (rest of the logic is unchanged)
        res.json({ recommendedVideo, recommendedAudio });
    } catch (error) {
        console.error('Error in /api/brain/recommend:', error);
        res.status(500).json({ message: 'Failed to get recommendations from AI model.' });
    }
});

// Chatbot Conversation Endpoint (Unchanged)
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: 'User message is required.' });
    try {
        const prompt = `You are Aura...`; // your prompt
        const result = await model_Chatbot.generateContent(prompt);
        const responseText = await result.response.text();
        res.json({ reply: responseText });
    } catch (error) {
        console.error('Error with Chatbot Gemini API:', error);
        res.status(500).json({ message: 'I am having trouble connecting right now.' });
    }
});


// 6. Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});