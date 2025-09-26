// chatbot.js

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Element References ---
    const textarea = document.getElementById("chat-textarea");
    const sendBtn = document.getElementById("send-btn");
    const commandBtn = document.getElementById("command-btn");
    const suggestedCommandsContainer = document.querySelector(".suggested-commands");
    const thinkingIndicator = document.getElementById("thinking-indicator");
    const mainChatContainer = document.getElementById("main-chat-container");
    const chatHistoryContainer = document.getElementById("chat-history-container");
    const voiceBtn = document.getElementById("voice-btn");
    const stopRecordingBtn = document.getElementById("stop-recording-btn");
    const voiceTimer = document.getElementById("voice-timer");
    const voiceVisualizer = document.getElementById("voice-visualizer");

    // --- 2. State Management ---
    let chatHistory = [];
    let isRecording = false;
    let recordingTime = 0;
    let recordingInterval = null;
    const VISUALIZER_BARS = 48;

    const commandSuggestions = [
        { icon: '✨', label: "Set an Intention", prefix: "/intention" },
        { icon: '😊', label: "Gratitude List", prefix: "/gratitude" },
        { icon: '🧘', label: "Deep Breathing", prefix: "/breathe" },
        { icon: '📓', label: "Reflect on Today", prefix: "/reflect" }
    ];

    // --- 3. Core Functions ---

    const saveHistory = () => {
        localStorage.setItem('mentalHealthChatHistory', JSON.stringify(chatHistory));
    };

    const loadHistory = () => {
        const savedHistory = localStorage.getItem('mentalHealthChatHistory');
        if (savedHistory && JSON.parse(savedHistory).length > 0) {
            chatHistory = JSON.parse(savedHistory);
        } else {
            // Start with a default welcome message if history is empty
            chatHistory = [{
                sender: 'ai',
                content: "Hello, I'm Aura. I'm here to listen. What's on your mind today?",
                timestamp: new Date().toISOString()
            }];
        }
        renderChatHistory();
    };
    
    const renderChatHistory = () => {
        chatHistoryContainer.innerHTML = '';
        chatHistory.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.classList.add('message', msg.sender);
            
            let contentHTML = msg.content
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>"); // Render newlines from AI

            if (msg.type === 'voice') {
                contentHTML = `<span class="voice-icon">🎤</span><em>${contentHTML}</em>`;
            }

            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageEl.innerHTML = `
                <div>${contentHTML}</div>
                <div class="timestamp">${time}</div>
            `;
            chatHistoryContainer.appendChild(messageEl);
        });
        // Scroll to the latest message
        chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    };

    const addUserMessage = (content, type = 'text') => {
        if (!content) return;
        chatHistory.push({ sender: 'user', content, type, timestamp: new Date().toISOString() });
        saveHistory();
        renderChatHistory();
        getAiResponse(content); // Get REAL AI response
    };

    // --- NEW: Function to get response from the backend ---
    const getAiResponse = async (userInput) => {
        thinkingIndicator.classList.add('visible');
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userInput,
                    history: chatHistory.slice(-10) // Send the last 10 messages for context
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong');
            }

            const data = await response.json();
            
            chatHistory.push({ sender: 'ai', content: data.reply, timestamp: new Date().toISOString() });
            saveHistory();
            renderChatHistory();

        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorMessage = { sender: 'ai', content: "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.", timestamp: new Date().toISOString() };
            chatHistory.push(errorMessage);
            saveHistory();
            renderChatHistory();
        } finally {
            thinkingIndicator.classList.remove('visible');
        }
    };

    const handleSendMessage = () => {
        const text = textarea.value.trim();
        if (text) {
            addUserMessage(text);
            textarea.value = "";
            adjustTextareaHeight();
        }
    };

    // --- Voice Recording & UI Logic (Unchanged) ---
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const animateVisualizer = () => {
        if (!isRecording) {
            voiceVisualizer.querySelectorAll('.visualizer-bar').forEach(bar => { bar.style.height = '15%'; });
            return;
        }
        voiceVisualizer.querySelectorAll('.visualizer-bar').forEach(bar => { bar.style.height = `${15 + Math.random() * 70}%`; });
        requestAnimationFrame(animateVisualizer);
    };

    const startRecording = () => {
        isRecording = true;
        mainChatContainer.classList.add('recording');
        recordingTime = 0;
        voiceTimer.textContent = formatTime(recordingTime);
        recordingInterval = setInterval(() => { recordingTime++; voiceTimer.textContent = formatTime(recordingTime); }, 1000);
        requestAnimationFrame(animateVisualizer);
    };

    const stopRecording = () => {
        isRecording = false;
        mainChatContainer.classList.remove('recording');
        clearInterval(recordingInterval);
        // In a real app, you'd convert speech to text here. For now, we simulate it.
        addUserMessage(`(Voice note recorded for ${formatTime(recordingTime)})`, 'voice');
        recordingTime = 0;
    };
    
    const adjustTextareaHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    const renderSuggestedCommands = () => {
        suggestedCommandsContainer.innerHTML = commandSuggestions.map(cmd => `<button class="suggested-cmd-btn" data-prefix="${cmd.prefix}">${cmd.icon} <span>${cmd.label}</span></button>`).join('');
        document.querySelectorAll('.suggested-cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prefix = btn.dataset.prefix;
                 addUserMessage(prefix);
            });
        });
    };

    // --- Initial Setup & Event Listeners ---
    (function initializeApp() {
        voiceVisualizer.innerHTML = '';
        for (let i = 0; i < VISUALIZER_BARS; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            voiceVisualizer.appendChild(bar);
        }
        renderSuggestedCommands();
        adjustTextareaHeight();
        loadHistory();

        sendBtn.addEventListener('click', handleSendMessage);
        textarea.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
        textarea.addEventListener('input', adjustTextareaHeight);
        voiceBtn.addEventListener('click', startRecording);
        stopRecordingBtn.addEventListener('click', stopRecording);
    })();
});