// student/home.js
document.addEventListener('DOMContentLoaded', () => {
    const welcomeHeading = document.getElementById('welcome-heading');
    // Function to fetch the logged-in user's details
    async function fetchUserInfo() {

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, user is not logged in.');
            // Optionally, redirect to login page if no token is found
            // window.location.href = '../login.html';
            return;
        }

        try {
            // Use the /api/users/me endpoint we created for the counselor
            const response = await fetch('http://localhost:3000/api/users/me', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user information.');
            }

            const user = await response.json();
            
            // Update the h1 tag with the user's name
            if (welcomeHeading) {
                welcomeHeading.textContent = `Welcome, ${user.name}!`;
            }

        } catch (error) {
            console.error('Error:', error);
            // If there's an error, the heading will just remain "Welcome, Student!"
        }
    }

    // Call the function when the page loads
    fetchUserInfo();
});