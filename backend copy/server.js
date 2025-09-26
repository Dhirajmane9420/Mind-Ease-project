// 1. Import necessary packages
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const connectDB = require('./config/db'); // Your DB connection function
require('dotenv').config();

// --- Gemini API Clients ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Client for Resource Recommendations (uses GEMINI_API_KEY)
const genAI_Resources = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model_Resources = genAI_Resources.getGenerativeModel({ model: "gemini-1.5-flash" });

// Client for the Chatbot (uses CHATBOT_API_KEY)
const genAI_Chatbot = new GoogleGenerativeAI(process.env.CHATBOT_API_KEY);
const model_Chatbot = genAI_Chatbot.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize Express App
const app = express();

// --- Load Resource Data Synchronously at Startup ---
let resourcesData = {};
try {
    const filePath = path.join(__dirname, 'resources.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    resourcesData = JSON.parse(fileContent);
    console.log('Successfully loaded resources from resources.json');
} catch (error) {
    console.error('Error reading or parsing resources.json:', error);
    // Initialize with empty objects if file is missing or corrupt
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

// --- Main function to start the server ---
const startServer = async () => {
  try {
    // 1. Connect to the Database FIRST
    await connectDB();

    // 2. Load Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static File Serving (for CSS, JS, images from the root)
    app.use(express.static(__dirname));
    
    // 4. Define API Routes using Routers
    app.use('/api/users', require('./routes/users'));
    // When you create bookings.js, you'll add: app.use('/api/bookings', require('./routes/bookings'));

    // --- Other specific API Endpoints ---

    // Resource library endpoint
    app.get('/api/resources', (req, res) => res.json(resourcesData));

    // Audio Proxy
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
    
    // "Brain" API for Resource Recommendations
    app.post('/api/brain/recommend', async (req, res) => {
        const { stressLevel } = req.body;
        if (!stressLevel) return res.status(400).json({ message: 'Stress level is required.' });
        try {
            const prompt = `You are a compassionate wellness assistant...`; // your prompt
            const result = await model_Resources.generateContent(prompt);
            // ... (rest of the logic)
            // res.json({ recommendedVideo, recommendedAudio }); // Make sure to send a response
        } catch (error) {
            console.error('Error in /api/brain/recommend:', error);
            res.status(500).json({ message: 'Failed to get recommendations from AI model.' });
        }
    });

    // Chatbot Conversation Endpoint
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


    // 5. Start the Express Server (ONLY ONCE)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Could not start server", error);
    process.exit(1);
  }
};

// --- Run the server ---
startServer();