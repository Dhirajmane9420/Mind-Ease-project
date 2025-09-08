document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        filters: { dept: "", year: "", lang: "", risk: "", rangeDays: 30, text: "" },
        datasets: { }
    };

    // Your original Mock Data Generators
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = (arr) => arr[rand(0, arr.length - 1)];
    const today = new Date();
    const fmtDate = (d) => d.toISOString().split("T")[0];

   function generateMock() {
        const depts = ["Engineering", "Science", "Arts", "Commerce"];
        const categories = ["Anxiety", "Academics", "Relationships"];
        state.datasets.appointments = Array.from({ length: 5 }, (_, i) => ({ id: "BKG" + (1000 + i), dept: pick(depts), status: pick(["Pending", "Completed"]) }));
        state.datasets.appointmentsFull = Array.from({ length: 20 }, (_, i) => ({ id: "BKG" + (2000 + i), student: "STU" + (4000+i), counsellor: "Dr. Sharma", status: pick(["Pending", "Completed", "Cancelled"]), date: "2025-09-0" + rand(1,8)}));
        state.datasets.peerFlags = Array.from({ length: 4 }, (_, i) => ({ thread: "TH-" + (200 + i), cat: pick(categories), flags: rand(1, 6) }));
        state.datasets.screenings = Array.from({ length: 15 }, (_, i) => ({ date: "2025-09-0" + rand(1,8), student: "STU"+(3000+i), tool: pick(["PHQ-9", "GAD-7"]), score: rand(5,20), severity: pick(["Moderate", "Severe", "Mild"])}));
        state.datasets.resources = Array.from({ length: 5 }, (_, i) => ({ title: "Resource Title " + i, type: pick(["Video", "Guide"]), topic: pick(categories), clicks: rand(50,500)}));
        state.datasets.counsellors = Array.from({ length: 4 }, (_, i) => ({ name: "Counselor " + i, spec: "Specialization", slots: rand(10,20), wait: rand(1,5) + "d"}));
    }

    // Your original Render Helpers
    function setActiveTab(tab) {
        document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.tab').forEach(sec => sec.style.display = 'none');
        const el = document.getElementById('tab-' + tab);
        if (el) el.style.display = 'block';
    }

    function renderOverview() {
        const tbodyA = document.querySelector('#tableAppointments tbody');
        tbodyA.innerHTML = state.datasets.appointments.map(a => `<tr><td>${a.id}</td><td>${a.dept}</td><td><span class="badge ${a.status === 'Completed' ? 'ok' : 'warn'}">${a.status}</span></td><td>${a.date}</td></tr>`).join('');
        document.getElementById('apptCount').textContent = `${state.datasets.appointments.length} items`;

        const tbodyF = document.querySelector('#tablePeerFlags tbody');
        tbodyF.innerHTML = state.datasets.peerFlags.map(p => `<tr><td>${p.thread}</td><td>${p.cat}</td><td>${p.flags}</td><td><button class="btn">Review</button></td></tr>`).join('');
        document.getElementById('flagCount').textContent = `${state.datasets.peerFlags.length} items`;
    }
    function renderScreenings() {
        const tbody = document.querySelector('#tableScreenings tbody');
        tbody.innerHTML = state.datasets.screenings.map(s => `<tr><td>${s.date}</td><td>${s.student}</td><td>${s.tool}</td><td>${s.score}</td><td>${s.severity}</td></tr>`).join('');
    }
    function renderAppointmentsFull() {
        const tbody = document.querySelector('#tableAppointmentsFull tbody');
        if (!tbody) return; // safety check

        const appointments = state.datasets.appointmentsFull;
        tbody.innerHTML = appointments.map(a => {
            let badgeClass = '';
            if (a.status === 'Completed') badgeClass = 'ok';
            if (a.status === 'Pending') badgeClass = 'warn';
            if (a.status === 'Cancelled') badgeClass = 'danger';
            
            return `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.student}</td>
                    <td>${a.counsellor}</td>
                    <td><span class="badge ${badgeClass}">${a.status}</span></td>
                    <td>${a.date}</td>
                </tr>
            `;
        }).join('');
        
        const countEl = document.getElementById('apptFullCount');
        if(countEl) countEl.textContent = `${appointments.length} items found`;
    }

    function renderPeerThreads() {
        const tbody = document.querySelector('#tablePeerThreads tbody');
        tbody.innerHTML = state.datasets.peerFlags.map(p => `<tr><td>${p.thread}</td><td>${p.cat}</td><td>${p.flags}</td><td>Open</td><td>2025-09-0${rand(1,8)}</td></tr>`).join('');
    }
    function renderResources() {
         const tbody = document.querySelector('#tableResources tbody');
        tbody.innerHTML = state.datasets.resources.map(r => `<tr><td>${r.title}</td><td>${r.type}</td><td>${r.topic}</td><td>${r.clicks}</td></tr>`).join('');
    }
    function renderCounsellors() {
        const tbody = document.querySelector('#tableCounsellors tbody');
        tbody.innerHTML = state.datasets.counsellors.map(c => `<tr><td>${c.name}</td><td>${c.spec}</td><td>${c.slots}</td><td>${c.wait}</td></tr>`).join('');
    }

    let chartTrends, chartRisk;
    function renderCharts() {
        const isDark = document.documentElement.classList.contains('dark');
        Chart.defaults.color = isDark ? 'rgba(203, 213, 225, 0.8)' : 'rgba(51, 65, 85, 0.8)';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

        const ctx1 = document.getElementById('chartTrends');
        if (chartTrends) chartTrends.destroy();
        chartTrends = new Chart(ctx1, { type: 'line', data: { labels: ["Wk1", "Wk2", "Wk3", "Wk4"], datasets: [{ label: 'PHQ-9', data: [8, 9, 7, 10], borderColor: '#0f766e', tension: 0.4 }, { label: 'GAD-7', data: [6, 7, 6, 8], borderColor: '#c89c00', tension: 0.4 }] }, options: { plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } } } });

        const ctx2 = document.getElementById('chartRisk');
        if (chartRisk) chartRisk.destroy();
        chartRisk = new Chart(ctx2, { type: 'doughnut', data: { labels: ['Low', 'Moderate', 'High'], datasets: [{ data: [60, 30, 10], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }] }, options: { plugins: { legend: { display: false } }, cutout: '70%' } });
    }

    // Your original Init function with all event listeners
    function init() {
        generateMock();
        renderOverview();
        renderCharts();


        document.querySelectorAll('#nav button').forEach(btn => {
            btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
        });
    }

        // Add other original event listeners from your code here
        // for filters, modals, etc.
        
        document.getElementById('themeToggle').addEventListener('click', () => {
             const isDark = document.documentElement.classList.toggle('dark');
             localStorage.setItem('theme', isDark ? 'dark' : 'light');
             renderCharts();
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            alert('You have been logged out.');
            // window.location.href = '../login.html';
        });

        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }
        renderCharts();

        function setActiveTab(tab) {
            document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
            document.querySelectorAll('.tab').forEach(sec => sec.style.display = 'none');
        
            const el = document.getElementById('tab-' + tab);
            if (el) el.style.display = 'block';

            // Call the correct render function for the active tab
            switch(tab) {
                case 'overview': renderOverview(); break;
                case 'screenings': renderScreenings(); break;
                case 'appointments': renderAppointmentsFull(); break;
                case 'peer': renderPeerThreads(); break;
                case 'resources': renderResources(); break;
                case 'counsellors': renderCounsellors(); break;
            }
        }
    init();
});