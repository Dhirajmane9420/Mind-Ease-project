document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // Element Selectors
    // =========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const counselorNameSpan = document.getElementById('counselor-name-display');
    const logoutBtn = document.getElementById('logout-btn');

    // Page content sections
    const dashboardContent = document.getElementById('dashboard-content');
    const chatContent = document.getElementById('chat-content');
    const alertsContent = document.getElementById('alerts-content');
    const alertsGrid = document.getElementById('alerts-grid'); //

    // Navigation links
    const studentsLink = document.getElementById('students-link');
    const messagesLink = document.getElementById('messages-link');
    const alertsLink = document.getElementById('alerts-link');
    
    // Chat components
    const chatListContainer = document.getElementById('chat-list-container');
    const chatListContainerDesktop = document.getElementById('chat-list-container-desktop');
    const chatHeader = document.getElementById('chat-header');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    const greetingHeader = document.getElementById('greeting-header'); // New
    const greetingSubheader = document.getElementById('greeting-subheader'); // New

    function updateGreeting() {
        const name = sessionStorage.getItem('loggedInCounselorName') || 'Counselor';
        const currentHour = new Date().getHours();
        let greeting = 'Welcome';

        if (currentHour < 12) {
            greeting = 'Good Morning ! Welcome Dr. ';
        } else if (currentHour < 18) {
            greeting = 'Good Afternoon ! Welcome Dr. ';
        } else {
            greeting = 'Good Evening  ! Welcome Dr. ';
        }

        // Update the main header greeting
        if (greetingHeader) {
            greetingHeader.textContent = `${greeting} ${name.split(' ')[0]} `; // Shows "Good Morning, Dr.!" or "Good Morning, Anya!"
        }

        // Update the name display in the top-right corner
        if (counselorNameSpan) {
            counselorNameSpan.textContent = name;
        }

        // You can update the subheader too if you like
        if (greetingSubheader) {
            const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            greetingSubheader.textContent = `Today is ${date}.`;
        }
    }

    // =========================================
    // Mock Chat Data
    // =========================================
    const chatData = {
        david: {
            name: "David G.",
            messages: [
                { sender: 'student', text: 'Hi, I have a question about my report.' }, 
                { sender: 'counsellor', text: 'Hello David, of course. What would you like to know?' }
            ]
        },
        maria: {
            name: "Maria S.",
            messages: [
                { sender: 'student', text: 'I need to talk. I\'m feeling a lot of anxiety about exams.' }
            ]
        }
    };
    let currentStudentId = null;

    // =========================================
    // DYNAMIC CONTENT & LOGOUT
    // =========================================
    function setCounselorName() {
        const name = sessionStorage.getItem('loggedInCounselorName');
        if (name && counselorNameSpan) {
            counselorNameSpan.textContent = name;
        }
    }

    function logout() {
        sessionStorage.removeItem('loggedInCounselorName');
        window.location.href = '../login.html';
    }

    // =========================================
    // Theme Management
    // =========================================
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }

    // =========================================
    // CHAT FUNCTIONALITY
    // =========================================
    function populateStudentLists() {
        chatListContainer.innerHTML = ''; // Clear mobile list
        chatListContainerDesktop.innerHTML = ' <h2 class="text-lg font-semibold mb-2">Student Conversations</h2>'; // Clear and re-add header for desktop
        
        for (const studentId in chatData) {
            const student = chatData[studentId];
            const studentDiv = document.createElement('div');
            studentDiv.className = 'p-2 border-b border-slate-200/50 cursor-pointer hover:bg-slate-50/50';
            studentDiv.dataset.studentId = studentId;
            studentDiv.innerHTML = `<h4 class="font-semibold">${student.name}</h4>`;
            
            studentDiv.addEventListener('click', () => {
                currentStudentId = studentId;
                loadChat(studentId);
            });
            
            // Append to both mobile and desktop lists
            chatListContainer.appendChild(studentDiv.cloneNode(true));
            chatListContainerDesktop.appendChild(studentDiv);
        }
        
        // Re-add event listeners for the cloned mobile list
        chatListContainer.querySelectorAll('.p-2').forEach(item => {
             item.addEventListener('click', () => {
                currentStudentId = item.dataset.studentId;
                loadChat(item.dataset.studentId);
            });
        });
    }

    function populateAlertsPage() {
        // Clear any existing alerts to prevent duplicates
        alertsGrid.innerHTML = '';
        
        // Find all student cards from the main dashboard
        const allStudentCards = dashboardContent.querySelectorAll('.card');

        let alertCount = 0;
        allStudentCards.forEach(card => {
            // Check if the card contains a critical dot
            const hasCriticalDot = card.querySelector('.critical-dot');
            if (hasCriticalDot) {
                // If it's a critical case, clone the card and add it to the alerts grid
                const cardClone = card.cloneNode(true);
                alertsGrid.appendChild(cardClone);
                alertCount++;
            }
        });

        // If no alerts, show a message
        if (alertCount === 0) {
            alertsGrid.innerHTML = '<p class="col-span-full text-slate-500">No critical alerts at this time.</p>';
        }
    }


    function loadChat(studentId) {
        chatMessages.innerHTML = '';
        const student = chatData[studentId];
        chatHeader.textContent = `Chat with ${student.name}`;

        student.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.classList.add('message', msg.sender === 'counsellor' ? 'sent' : 'received');
            messageEl.textContent = msg.text;
            chatMessages.appendChild(messageEl);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text && currentStudentId) {
            const message = { sender: 'counsellor', text: text };
            chatData[currentStudentId].messages.push(message);
            
            const messageEl = document.createElement('div');
            messageEl.classList.add('message', 'sent');
            messageEl.textContent = text;
            chatMessages.appendChild(messageEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            chatInput.value = '';
        }
    });
    
    // =========================================
    // Main Initialization and Navigation
    // =========================================
    function initialize() {
        updateGreeting();
        //setCounselorName();
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        
        const currentTheme = localStorage.getItem('theme') || 'light';
        setTheme(currentTheme);

        if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark'));
        populateAlertsPage();
        if (menuBtn) menuBtn.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));

        function showSection(sectionId) {
            dashboardContent.classList.add('hidden');
            chatContent.classList.add('hidden');
            alertsContent.classList.add('hidden');
            const sectionToShow = document.getElementById(sectionId);
            if(sectionToShow) sectionToShow.classList.remove('hidden');
        }

        function setActiveLink(activeLink) {
            sidebarLinks.forEach(link => link.classList.remove('active'));
            activeLink.classList.add('active');
        }

        if (studentsLink) {
            studentsLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('dashboard-content');
                setActiveLink(studentsLink);
            });
        }
        if (messagesLink) {
            messagesLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('chat-content');
                setActiveLink(messagesLink);
            });
        }
        if (alertsLink) {
            alertsLink.addEventListener('click', (e) => {
                e.preventDefault();
                // The content is already populated, we just need to show it.
                showSection('alerts-content');
                setActiveLink(alertsLink);
            });
        }
        
        populateStudentLists();

    }
    
    initialize();
});