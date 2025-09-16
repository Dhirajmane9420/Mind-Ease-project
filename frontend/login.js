document.addEventListener('DOMContentLoaded', () => {
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

    // =========================================
    // Signup Functionality (Connects to Backend)
    // =========================================
    async function handleSignup() {
        const role = signupForm.dataset.role;
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg);
            }
            alert(`Account for ${name} created successfully! Please sign in.`);
            showRoleSelection();
        } catch (error) {
            alert(error.message);
        }
    }

    // =========================================
    // Login Functionality (Connects to Backend)
    // =========================================
    window.handleLogin = async function(role) {
        const email = document.getElementById(`${role}-email`).value;
        const password = document.getElementById(`${role}-password`).value;
        const errorDiv = document.getElementById(`${role}-login-error`);

        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg);
            }
            localStorage.setItem('token', data.token);
            const userPayload = JSON.parse(atob(data.token.split('.')[1]));
            if (userPayload.user.role !== role) {
                throw new Error('Role mismatch. Please log in through the correct portal.');
            }

            // --- REDIRECT PATHS CORRECTED TO MATCH YOUR STRUCTURE ---
            if (role === 'counselor') {
                window.location.href = './counselor/dashboard.html';
            } else if (role === 'student') {
                window.location.href = './student/home.html';
            } else if (role === 'admin') {
                window.location.href = './admin/dashboard.html';
            }

        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        }
    }

    // =========================================
    // Page Navigation (Functions attached to window for HTML onclick)
    // =========================================
    function hideAllAuthPages() {
       ['createAccountPage', 'roleSelectionPage', 'studentLoginPage', 'counselorLoginPage', 'adminLoginPage'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
    }
    
    window.showRoleSelection = function() {
        hideAllAuthPages();
        roleSelectionPage.classList.remove('hidden');
    }
    
    window.showCreateAccountPage = function() {
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

    window.showLoginPage = function(role) {
        hideAllAuthPages();
        if (role === 'student') studentLoginPage.classList.remove('hidden');
        if (role === 'counselor') counselorLoginPage.classList.remove('hidden');
        if (role === 'admin') adminLoginPage.classList.remove('hidden');
    }
    
    // =========================================
    // Initial Setup
    // =========================================
    const signupButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent === 'Create Account');
    if (signupButton) {
        signupButton.onclick = handleSignup;
    }
    
    const showSigninButton = document.getElementById('show-signin-button');
    if (showSigninButton) {
        showSigninButton.addEventListener('click', showRoleSelection);
    }
    
    showRoleSelection();
});