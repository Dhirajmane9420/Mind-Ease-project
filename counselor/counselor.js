/**
 * Logs the user out by redirecting them to the main login page.
 */
function logout() {
    console.log("Logging out counselor...");
    // For this project, redirecting to the login page is how we log out.
    // In a real app, you would also clear session tokens here.
    window.location.href = '../login.html';
}

// === NEW: MODAL FUNCTIONS FOR CALENDAR ===

// Get modal elements
const appointmentModal = document.getElementById('appointmentModal');
const modalStudentId = document.getElementById('modalStudentId');
const modalTime = document.getElementById('modalTime');

/**
 * Shows the appointment details modal with specific info.
 * @param {string} studentId - The ID of the student.
 * @param {string} time - The time of the appointment.
 */
function showAppointmentDetails(studentId, time) {
    if (appointmentModal) {
        modalStudentId.textContent = studentId;
        modalTime.textContent = time;
        appointmentModal.classList.remove('hidden');
    }
}

/**
 * Closes the appointment details modal.
 */
function closeModal() {
    if (appointmentModal) {
        appointmentModal.classList.add('hidden');
    }
}