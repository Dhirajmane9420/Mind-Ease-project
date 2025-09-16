// --- CHATBOT GLOBAL VARIABLES ---
const chatToggleBtn = document.getElementById('chatToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const historyPanel = document.getElementById('historyPanel');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const notificationBubble = document.getElementById('notificationBubble');

// --- ADDED: Central API endpoint configuration ---
const API_ENDPOINT = 'http://localhost:3000/api/chat';

let chatState = 'closed'; // closed, medium, fullscreen
let isTyping = false;
let currentSpace = 'general';
let sessionHistory = [];

const chatSpaces = {
    general: [], study: [], wellness: [], crisis: []
};


// --- CHATBOT FUNCTIONS (Most functions remain the same) ---

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
            role: msg.classList.contains('user') ? 'user' : 'model',
            parts: [{ text: msg.textContent.replace(msg.querySelector('.timestamp')?.textContent || '', '').trim() }]
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
        spaceMessages.forEach(msg => {
            const text = msg.parts[0].text;
            const sender = msg.role === 'user' ? 'user' : 'bot';
            addMessageToSpace(text, sender, msg.timestamp);
        });
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

// --- MODIFIED: The sendMessage function is now async to handle the API call ---
async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '' || isTyping) return;

    addMessageToSpace(message, 'user');
    messageInput.value = '';
    
    showTypingIndicator();
    
    // Get the current conversation history to send for context
    const history = getCurrentMessages();

    try {
        // This 'fetch' call is the actual connection to your backend server
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                space: currentSpace,
                history: history.slice(0, -1) // Send history without the user's latest message
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const botReply = data.reply;

        hideTypingIndicator();
        addMessageToSpace(botReply, 'bot');
        
    } catch (error) {
        console.error('Error connecting to backend:', error);
        hideTypingIndicator();
        addMessageToSpace('Sorry, I\'m having trouble connecting right now. Please make sure the server is running and try again.', 'bot');
    } finally {
        // Save the full conversation including the bot's latest reply
        saveChatData();
    }
}


// --- REMOVED: The old getBotResponse function is no longer needed ---


// --- All other functions (toggleChatSize, closeChat, history, etc.) remain unchanged ---
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
    if (messages.length > 1) {
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
    const userMessage = messages.find(msg => msg.role === 'user');
    return userMessage ? userMessage.parts[0].text.substring(0, 30) + '...' : 'Chat Session';
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
    session.messages.forEach(msg => addMessageToSpace(msg.parts[0].text, msg.role === 'user' ? 'user' : 'bot', msg.timestamp));
    toggleHistory();
}
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatToggle')) {
        initializeChatHistory();
        setTimeout(() => {
            if (chatState === 'closed' && notificationBubble) {
                notificationBubble.style.display = 'flex';
            }
        }, 5000);
        
        const toggle = document.getElementById('chatToggle');
        toggle.addEventListener('mouseenter', () => toggle.classList.remove('floating'));
        toggle.addEventListener('mouseleave', () => {
            if (chatState === 'closed') toggle.classList.add('floating');
        });
    }
});