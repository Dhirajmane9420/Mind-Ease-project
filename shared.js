// --- CHATBOT GLOBAL VARIABLES ---
const chatToggleBtn = document.getElementById('chatToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const historyPanel = document.getElementById('historyPanel');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const notificationBubble = document.getElementById('notificationBubble');

let chatState = 'closed'; // closed, medium, fullscreen
let isTyping = false;
let currentSpace = 'general';
let sessionHistory = [];

const chatSpaces = {
    general: [], study: [], wellness: [], crisis: []
};


// --- CHATBOT FUNCTIONS ---

function initializeChatHistory() {
    const savedSpaces = localStorage.getItem('campusmind_chat_spaces');
    const savedSessions = localStorage.getItem('campusmind_sessions');
    
    if (savedSpaces) Object.assign(chatSpaces, JSON.parse(savedSpaces));
    if (savedSessions) sessionHistory = JSON.parse(savedSessions);
    
    loadCurrentSpace();
}

function saveChatData() {
    localStorage.setItem('campusmind_chat_spaces', JSON.stringify(chatSpaces));
    localStorage.setItem('campusmind_sessions', JSON.stringify(sessionHistory));
}

function switchSpace(spaceName) {
    // Save the current messages before switching
    chatSpaces[currentSpace] = getCurrentMessages();
    
    document.querySelectorAll('.space-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(spaceName)) {
            tab.classList.add('active');
        }
    });
    
    currentSpace = spaceName;
    loadCurrentSpace();
    saveChatData();
}

function getCurrentMessages() {
    const messages = [];
    document.querySelectorAll('#chatMessages .message').forEach(msg => {
        messages.push({
            text: msg.textContent.replace(msg.querySelector('.timestamp')?.textContent || '', '').trim(),
            sender: msg.classList.contains('user') ? 'user' : 'bot',
            timestamp: new Date().toISOString()
        });
    });
    return messages;
}

function loadCurrentSpace() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    const spaceMessages = chatSpaces[currentSpace] || [];
    
    if (spaceMessages.length === 0) {
        const welcomeMessages = {
            general: "Hi there! 👋 I'm your CampusMind assistant. How can I assist you today?",
            study: "Welcome to Study Help! 📚 What subject are you working on?",
            wellness: "Welcome to your Wellness Space! 🧘 I'm here to support your mental health journey.",
            crisis: "🆘 If you're in immediate danger, please call 911. For mental health emergencies, call 988. I am here to connect you with resources."
        };
        addMessageToSpace(welcomeMessages[currentSpace], 'bot');
    } else {
        spaceMessages.forEach(msg => addMessageToSpace(msg.text, msg.sender, msg.timestamp));
    }
}

function addMessageToSpace(text, sender, timestamp = null) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
    messageDiv.innerHTML = `${text}<span class="timestamp">${timeStr}</span>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function toggleChatSize() {
    if (chatState === 'closed') {
        chatState = 'medium';
        chatbotContainer.classList.add('show');
        chatToggleBtn.style.display = 'none';
        if(notificationBubble) notificationBubble.style.display = 'none';
        
        setTimeout(() => { messageInput.focus(); }, 400);
    }
}

function toggleFullscreen() {
    chatbotContainer.classList.toggle('fullscreen');
    chatState = chatbotContainer.classList.contains('fullscreen') ? 'fullscreen' : 'medium';
}

function closeChat() {
    saveCurrentSession();
    chatState = 'closed';
    chatbotContainer.classList.remove('show', 'fullscreen');
    chatToggleBtn.style.display = 'flex';
    chatToggleBtn.classList.add('floating');
}

function saveCurrentSession() {
    const messages = getCurrentMessages();
    if (messages.length > 1) { // Only save if there's more than the welcome message
        const session = {
            id: Date.now(),
            space: currentSpace,
            messages: messages,
            date: new Date().toISOString(),
            title: generateSessionTitle(messages)
        };
        sessionHistory.unshift(session);
        if (sessionHistory.length > 50) sessionHistory = sessionHistory.slice(0, 50);
        saveChatData();
    }
}

function generateSessionTitle(messages) {
    const userMessage = messages.find(msg => msg.sender === 'user');
    return userMessage ? userMessage.text.substring(0, 30) + (userMessage.text.length > 30 ? '...' : '') : 'Chat Session';
}

function toggleHistory() {
    const isVisible = historyPanel.classList.contains('show');
    if (isVisible) {
        historyPanel.classList.remove('show');
    } else {
        loadHistoryList();
        historyPanel.classList.add('show');
    }
}

function loadHistoryList() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    if (sessionHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">No chat history yet</p>';
        return;
    }
    sessionHistory.forEach(session => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadSession(session);
        const date = new Date(session.date).toLocaleDateString();
        const time = new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        historyItem.innerHTML = `<h4>${session.title}</h4><p>Space: ${session.space.charAt(0).toUpperCase() + session.space.slice(1)}</p><div class="history-meta">${date} at ${time} • ${session.messages.length} messages</div>`;
        historyList.appendChild(historyItem);
    });
}

function loadSession(session) {
    switchSpace(session.space);
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    session.messages.forEach(msg => addMessageToSpace(msg.text, msg.sender, msg.timestamp));
    toggleHistory();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '' || isTyping) return;
    
    addMessageToSpace(message, 'user');
    messageInput.value = '';
    chatSpaces[currentSpace] = getCurrentMessages();
    saveChatData();
    
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        const response = getBotResponse(message, currentSpace);
        addMessageToSpace(response, 'bot');
        chatSpaces[currentSpace] = getCurrentMessages();
        saveChatData();
    }, 1200 + Math.random() * 800);
}

function showTypingIndicator() {
    isTyping = true;
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    sendBtn.disabled = true;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
    sendBtn.disabled = false;
}

function getBotResponse(message, space) {
    const spaceResponses = {
        general: [ "That's an interesting point. Could you tell me more?", "I understand. How can I best assist you with this?", "Thank you for sharing. What would you like to explore further?", "I'm here to help. What specific information are you looking for?" ],
        study: [ "Great question! Have you heard of the Pomodoro Technique? It can be very effective for focus.", "For better memory retention, I recommend active recall and spaced repetition.", "It's important to take breaks. What subject are you studying right now?", "A structured study plan can make a big difference." ],
        wellness: [ "Thank you for opening up. Please remember to be kind to yourself.", "Your mental health is a priority. Have you tried any deep breathing or mindfulness exercises today?", "I am here to listen without judgment. Expressing your feelings can be a powerful step.", "Self-care is vital. Is there a small, kind thing you can do for yourself today?" ],
        crisis: [ "I hear you, and I'm glad you reached out. It's important to know that help is available and you are not alone.", "If you are in crisis, please contact the Crisis Lifeline at 988 immediately.", "Your safety is the most important thing. Are you in a safe location right now?", "There are professionals available 24/7. I can provide you with resources." ]
    };
    const responses = spaceResponses[space] || spaceResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
}


// --- INITIALIZATION ---
// This runs when any page that includes this script is loaded
document.addEventListener('DOMContentLoaded', function() {
    // This check is important: it ensures chatbot code only runs on pages that have the chatbot HTML
    if (document.getElementById('chatToggle')) {
        initializeChatHistory();

        // Show notification bubble after a delay
        setTimeout(() => {
            if (chatState === 'closed' && notificationBubble) {
                 notificationBubble.style.display = 'flex';
            }
        }, 5000);
        
        // Handle floating animation for chat toggle button
        const toggle = document.getElementById('chatToggle');
        toggle.addEventListener('mouseenter', () => toggle.classList.remove('floating'));
        toggle.addEventListener('mouseleave', () => {
            if (chatState === 'closed') toggle.classList.add('floating');
        });
    }
});