const bookingModal = document.getElementById('bookingModal');
const modalTitle = document.getElementById('modalTitle');

function showBookingModal(counselorName) {
    modalTitle.textContent = `Available Times for ${counselorName}`;
    bookingModal.classList.remove('hidden');
}

function hideBookingModal() {
    bookingModal.classList.add('hidden');
}

function confirmBooking() {
     hideBookingModal();
     setTimeout(() => alert('Your appointment has been successfully booked!'), 100);
}