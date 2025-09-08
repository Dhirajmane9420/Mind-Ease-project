document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // Persistent User Database using localStorage
    // =========================================
    if (!localStorage.getItem('campusMindUsers')) {
        const defaultUsers = {
            'counselor@example.com': { name: 'Dr. Anya Sharma', password: 'pass123', role: 'counselor' },
            'student@example.com': { name: 'Test Student', password: 'pass123', role: 'student' }
        };
        localStorage.setItem('campusMindUsers', JSON.stringify(defaultUsers));
    }

    // =========================================
    // Element Selectors
    // =========================================
    const createAccountPage = document.getElementById('createAccountPage');
    const roleSelectionPage = document.getElementById('roleSelectionPage');
    const studentLoginPage = document.getElementById('studentLoginPage');
    const counselorLoginPage = document.getElementById('counselorLoginPage');
    const adminLoginPage = document.getElementById('adminLoginPage');
    const signupRoleSelector = document.getElementById('signupRoleSelector');
    const signupForm = document.getElementById('signupForm');
    const createAccountSubtitle = document.getElementById('createAccountSubtitle');
    const showSigninButton = document.getElementById('show-signin-button');
    
    // =========================================
    // Signup Functionality
    // =========================================
    function handleSignup() {
        const role = signupForm.dataset.role;
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }
        const users = JSON.parse(localStorage.getItem('campusMindUsers'));
        if (users[email]) {
            alert('An account with this email already exists. Please sign in.');
            return;
        }
        users[email] = { name, password, role };
        localStorage.setItem('campusMindUsers', JSON.stringify(users));
        alert(`Account for ${name} created successfully! You can now sign in.`);
        showRoleSelection();
    }
    
    // =========================================
    // Login Functionality
    // =========================================
    window.handleLogin = function(role) {
        const email = document.getElementById(`${role}-email`).value;
        const password = document.getElementById(`${role}-password`).value;
        const errorDiv = document.getElementById(`${role}-login-error`);
        const users = JSON.parse(localStorage.getItem('campusMindUsers'));
        const user = users[email];

        if (user && user.password === password && user.role === role) {
            if (role === 'counselor') {
                sessionStorage.setItem('loggedInCounselorName', user.name);
                window.location.href = './counselor/dashboard.html';
            } else if (role === 'student') {
                sessionStorage.setItem('loggedInStudentName', user.name);
                window.location.href = './student/home.html';
            } else if (role === 'admin') {
                sessionStorage.setItem('loggedInAdminName', user.name);
                window.location.href = './admin/dashboard.html';;
            }
        } else {
            if (errorDiv) {
                errorDiv.textContent = 'Invalid credentials or role mismatch.';
                errorDiv.classList.remove('hidden');
            }
        }
    }

    // =========================================
    // Page Navigation
    // =========================================
    function showCreateAccountPage() {
        hideAllAuthPages();
        createAccountPage.classList.remove('hidden');
        resetSignup();
    }
    
    window.selectSignupRole = function(role) {
        signupRoleSelector.classList.add('hidden');
        signupForm.classList.remove('hidden');
        createAccountSubtitle.textContent = `Creating a new ${role.charAt(0).toUpperCase() + role.slice(1)} account.`;
        signupForm.dataset.role = role;
    }

    window.resetSignup = function() {
        signupRoleSelector.classList.remove('hidden');
        signupForm.classList.add('hidden');
        createAccountSubtitle.textContent = 'First, please select your role.';
        delete signupForm.dataset.role;
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
    }
    
    function showRoleSelection() {
        hideAllAuthPages();
        roleSelectionPage.classList.remove('hidden');
    }

    window.showLoginPage = function(role) {
        hideAllAuthPages();
        if (role === 'student') studentLoginPage.classList.remove('hidden');
        if (role === 'counselor') counselorLoginPage.classList.remove('hidden');
        if (role === 'admin') adminLoginPage.classList.remove('hidden');
    }
    
    function hideAllAuthPages() {
        createAccountPage.classList.add('hidden');
        roleSelectionPage.classList.add('hidden');
        studentLoginPage.classList.add('hidden');
        counselorLoginPage.classList.add('hidden');
        adminLoginPage.classList.add('hidden');
    }
    
    const signupButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent === 'Create Account');
    if (signupButton) {
        signupButton.onclick = handleSignup;
    }

    if (showSigninButton) {
        showSigninButton.addEventListener('click', showRoleSelection);
    }

    // This now correctly calls the function to show the initial page.
    showCreateAccountPage();
});