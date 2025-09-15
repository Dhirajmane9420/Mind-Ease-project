// counselor/report.js
document.addEventListener('DOMContentLoaded', () => {
    const totalAppointmentsEl = document.getElementById('total-appointments-stat');
    const reportTableBodyEl = document.getElementById('report-table-body');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // --- Function to fetch the main statistics ---
    async function fetchStatsData() {
        try {
            const response = await fetch('http://localhost:3000/api/reports/stats', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Could not fetch stats.');
            totalAppointmentsEl.textContent = data.totalAppointments;
        } catch (error) {
            totalAppointmentsEl.textContent = 'Error';
            console.error('Stat Fetch Error:', error);
        }
    }

    // --- NEW Function to fetch the detailed appointment list ---
    async function fetchAppointmentList() {
        try {
            const response = await fetch('http://localhost:3000/api/reports/appointments', {
                headers: { 'x-auth-token': token }
            });
            const appointments = await response.json();
            if (!response.ok) throw new Error(appointments.msg || 'Could not fetch appointments.');
            
            reportTableBodyEl.innerHTML = ''; // Clear "Loading..." message

            if (appointments.length === 0) {
                reportTableBodyEl.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center">No appointments found.</td></tr>`;
                return;
            }

            appointments.forEach(appt => {
                const date = new Date(appt.date);
                const tableRow = document.createElement('tr');
                tableRow.className = 'border-b';
                tableRow.innerHTML = `
                    <td class="px-6 py-4 font-medium">${appt.student.name}</td>
                    <td class="px-6 py-4">${appt.student.email}</td>
                    <td class="px-6 py-4">${date.toLocaleDateString('en-IN')}</td>
                    <td class="px-6 py-4">${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                `;
                reportTableBodyEl.appendChild(tableRow);
            });

        } catch (error) {
            reportTableBodyEl.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-red-500">${error.message}</td></tr>`;
        }
    }
    
    // Call both functions when the page loads
    fetchStatsData();
    fetchAppointmentList();
});