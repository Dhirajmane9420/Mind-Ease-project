document.addEventListener('DOMContentLoaded', () => {
    const bookingModal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const confirmationDiv = document.getElementById('booking-confirmation');
    const counselorListDiv = document.getElementById('counselor-list');

    let selectedCounselorId = null;
    let selectedDate = null;

    // --- Checks for existing appointments when the page loads ---
    async function checkExistingAppointments() {
        const token = localStorage.getItem('token');
        if (!token) {
            fetchAndDisplayCounselors();
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/appointments/my-appointments', {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                fetchAndDisplayCounselors();
                return;
            }

            const appointments = await response.json();

            if (appointments.length > 0) {
                const appointment = appointments[0];
                const appointmentDate = new Date(appointment.date).toLocaleString();
                const counselorName = appointment.counselor ? appointment.counselor.name : 'your counselor';
                
                if(counselorListDiv) counselorListDiv.style.display = 'none';
                confirmationDiv.innerHTML = `
                    <div style="color: #155724; border: 1px solid #c3e6cb; padding: 1rem; border-radius: 8px; background-color: #d4edda;">
                        <h3 style="font-weight: bold;">You Have an Upcoming Appointment</h3>
                        <p>Your session with <strong>${counselorName}</strong> is scheduled for:</p>
                        <p><strong>${appointmentDate}</strong></p>
                    </div>
                `;
            } else {
                fetchAndDisplayCounselors();
            }
        } catch (error) {
            console.error('Error checking appointments:', error);
            fetchAndDisplayCounselors();
        }
    }

    // --- Fetches and displays the list of available counselors ---
    async function fetchAndDisplayCounselors() {
        if (!counselorListDiv) return;
        try {
            const response = await fetch('http://localhost:3000/api/users/counselors');
            const counselors = await response.json();
            if (!response.ok) { throw new Error('Could not fetch counselors.'); }

            counselorListDiv.innerHTML = '';
            if (counselors.length === 0) {
                counselorListDiv.innerHTML = '<p>No counselors are available.</p>';
                return;
            }

            counselors.forEach(counselor => {
                const counselorCard = document.createElement('div');
                counselorCard.className = 'flex items-center justify-between p-4 border rounded-lg bg-white';
                counselorCard.innerHTML = `
                    <div class="flex items-center">
                        <img src="https://placehold.co/100x100/e2e8f0/334155?text=C" class="w-16 h-16 rounded-full mr-4" alt="${counselor.name}">
                        <div>
                            <h3 class="font-semibold text-lg">${counselor.name}</h3>
                            <p class="text-slate-500">MindEase Counselor</p>
                        </div>
                    </div>
                    <button onclick="showBookingModal('${counselor.name}', '${counselor._id}')" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">View Availability</button>
                `;
                counselorListDiv.appendChild(counselorCard);
            });
        } catch (error) {
            counselorListDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // --- Functions for showing/hiding the modal ---
    window.showBookingModal = function(counselorName, counselorId) {
        selectedCounselorId = counselorId;
        selectedDate = null;
        document.querySelectorAll('.time-slot-btn').forEach(btn => btn.style.backgroundColor = 'white');
        modalTitle.textContent = `Available Times for ${counselorName}`;
        bookingModal.classList.remove('hidden');
    }

    window.hideBookingModal = function() {
        bookingModal.classList.add('hidden');
    }

    // --- Function to handle time selection ---
    window.selectTimeSlot = function(buttonElement) {
        selectedDate = buttonElement.dataset.date;
        document.querySelectorAll('.time-slot-btn').forEach(btn => btn.style.backgroundColor = 'white');
        buttonElement.style.backgroundColor = '#dbeafe';
    }

    // --- Function to confirm and book the appointment ---
    window.confirmBooking = async function() {
        if (!selectedCounselorId || !selectedDate) {
            alert('Please select a time slot.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            confirmationDiv.innerHTML = `<p style="color: red;">You must be logged in to book.</p>`;
            hideBookingModal();
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    counselorId: selectedCounselorId,
                    date: selectedDate
                })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.msg); }
            
            // After successful booking, re-run the check to show the confirmation
            checkExistingAppointments();

        } catch (error) {
            confirmationDiv.innerHTML = `<p style="color: red;">Booking failed: ${error.message}</p>`;
        } finally {
            hideBookingModal();
        }
    }

    // --- Initial call when the page loads ---
    checkExistingAppointments();
});