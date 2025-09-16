document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const greetingHeader = document.getElementById('greeting-header');
    const counselorNameSpan = document.getElementById('counselor-name-display');
    const logoutBtn = document.getElementById('logout-btn');
    const token = localStorage.getItem('token');

    // Page content sections
    const dashboardContent = document.getElementById('dashboard-content');
    const chatContent = document.getElementById('chat-content');
    
    // Appointment and Chat selectors
    const appointmentsGrid = document.querySelector('#dashboard-content .grid');
    const chatHeaderName = document.getElementById('chat-with-name');
    const chatMessagesDiv = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    
    let currentChatStudentId = null;
    let currentUserId = null; // To store the counselor's own ID

    // --- Main Initialization Function ---
    async function initializeDashboard() {
        if (!token) {
            window.location.href = '../login.html';
            return;
        }
        showDashboardView(); // Start on the main dashboard view
        
        // Fetch counselor info first, then appointments
        await fetchCounselorInfo(); 
        await fetchAppointments();

        // Event Listeners
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', showDashboardView);
        if (chatForm) chatForm.addEventListener('submit', handleSendMessage);
    }

    function logout() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    }

    // --- View Management ---
    function showDashboardView() {
        dashboardContent.classList.remove('hidden');
        chatContent.classList.add('hidden');
    }

    function showChatView(studentId, studentName) {
        dashboardContent.classList.add('hidden');
        chatContent.classList.remove('hidden');
        currentChatStudentId = studentId;
        chatHeaderName.textContent = `Chat with ${studentName}`;
        fetchMessages(studentId);
    }

    // --- Data Fetching and Rendering ---
    async function fetchCounselorInfo() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                headers: { 'x-auth-token': token }
            });
            const counselor = await response.json();
            if (!response.ok) throw new Error(counselor.msg);

            currentUserId = counselor._id; // Store counselor's ID

            const currentHour = new Date().getHours();
            let greeting = 'Welcome';
            if (currentHour < 12) greeting = 'Good Morning';
            else if (currentHour < 18) greeting = 'Good Afternoon';
            else greeting = 'Good Evening';
            greetingHeader.textContent = `${greeting}, Dr. ${counselor.name.split(' ')[0]}!`;
            counselorNameSpan.textContent = counselor.name;
        } catch (error) {
            console.error('Error fetching counselor info:', error);
        }
    }

    async function fetchAppointments() {
        try {
            const response = await fetch('http://localhost:3000/api/appointments/counselor', {
                headers: { 'x-auth-token': token }
            });
            const appointments = await response.json();
            if (!response.ok) throw new Error(appointments.msg);

            appointmentsGrid.innerHTML = '';
            if (appointments.length === 0) {
                appointmentsGrid.innerHTML = '<p class="col-span-full">You have no upcoming appointments.</p>';
                return;
            }

            appointments.forEach(appt => {
                const studentCard = document.createElement('div');
                studentCard.className = 'card p-4 flex flex-col items-center text-center cursor-pointer';
                const apptDate = new Date(appt.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                studentCard.innerHTML = `
                    <img src="https://placehold.co/80x80/e2e8f0/334155?text=S" alt="${appt.student.name}" class="rounded-full w-20 h-20 mb-3" />
                    <h3 class="font-semibold">${appt.student.name}</h3>
                    <p class="text-sm text-slate-500">${appt.student.email}</p>
                    <p class="text-xs text-slate-500 mt-1">${apptDate}</p>
                `;
                studentCard.addEventListener('click', () => showChatView(appt.student._id, appt.student.name));
                appointmentsGrid.appendChild(studentCard);
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }

    async function fetchMessages(studentId) {
        chatMessagesDiv.innerHTML = '<p>Loading messages...</p>';
        try {
            const response = await fetch(`http://localhost:3000/api/messages/${studentId}`, {
                headers: { 'x-auth-token': token }
            });
            const messages = await response.json();
            if (!response.ok) throw new Error(messages.msg);

            chatMessagesDiv.innerHTML = '';
            messages.forEach(msg => {
                const messageEl = document.createElement('div');
                const isSentByMe = msg.sender === currentUserId; // Check if sender is the counselor
                messageEl.className = `message ${isSentByMe ? 'sent' : 'received'}`;
                messageEl.textContent = msg.content;
                chatMessagesDiv.appendChild(messageEl);
            });
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        } catch (error) {
            chatMessagesDiv.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    async function handleSendMessage(event) {
        event.preventDefault();
        const content = chatInput.value.trim();
        if (!content || !currentChatStudentId) return;

        try {
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ receiverId: currentChatStudentId, content: content })
            });
            if (!response.ok) throw new Error('Message failed to send.');
            
            chatInput.value = '';
            fetchMessages(currentChatStudentId); // Refresh the chat
        } catch (error) {
            console.error('Send message error:', error);
        }
    }

    
    
    initializeDashboard();
});