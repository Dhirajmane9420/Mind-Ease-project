// State
const state = {
    filters: { dept: "", year: "", lang: "", risk: "", rangeDays: 30, text: "" },
    datasets: { appointments: [], peerFlags: [], screenings: [], screeningsFull: [], resources: [], counsellors: [] }
};

// Mock Data Generators
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const today = new Date();
const fmtDate = (d) => d.toISOString().split("T")[0];

function generateMock() {
    const depts = ["Engineering", "Science", "Arts", "Commerce", "Health Sciences"];
    const years = ["1", "2", "3", "4", "PG"];
    const langs = ["English", "Hindi", "Tamil", "Bengali", "Telugu", "Marathi", "Kannada", "Malayalam"];
    const risks = ["Low", "Moderate", "High", "Crisis"];
    const modes = ["In-person", "Phone", "Video"];
    const status = ["Pending", "Confirmed", "Completed", "Cancelled"];
    
    // Appointments (overview table)
    state.datasets.appointments = Array.from({ length: 10 }, (_, i) => ({ id: "BKG" + (1000 + i), dept: pick(depts), mode: pick(modes), status: pick(["Pending", "Confirmed", "Completed"]), date: fmtDate(new Date(today.getFullYear(), today.getMonth(), rand(1, 28))) }));

    // Peer flags (overview table)
    const categories = ["Anxiety", "Depression", "Academics", "Relationships", "Sleep", "Substance"];
    state.datasets.peerFlags = Array.from({ length: 8 }, (_, i) => ({ thread: "TH-" + (200 + i), cat: pick(categories), flags: rand(0, 6), last: fmtDate(new Date(today.getFullYear(), today.getMonth(), rand(1, 28))), action: "Review" }));

    // Screenings
    function severityPHQ(score) { if (score <= 4) return "Minimal"; if (score <= 9) return "Mild"; if (score <= 14) return "Moderate"; if (score <= 19) return "Moderately Severe"; return "Severe"; }
    function severityGAD(score) { if (score <= 4) return "Minimal"; if (score <= 9) return "Mild"; if (score <= 14) return "Moderate"; return "Severe"; }
    const tools = ["PHQ-9", "GAD-7", "GHQ-12"];
    state.datasets.screenings = Array.from({ length: 22 }, (_, i) => { const tool = pick(tools); const score = tool === "PHQ-9" ? rand(0, 27) : tool === "GAD-7" ? rand(0, 21) : rand(0, 36); const sev = tool === "PHQ-9" ? severityPHQ(score) : tool === "GAD-7" ? severityGAD(score) : (score <= 12 ? "Minimal" : score <= 18 ? "Mild" : score <= 24 ? "Moderate" : "Severe"); return { date: fmtDate(new Date(today.getFullYear(), today.getMonth() - rand(0, 2), rand(1, 28))), student: "STU" + (3000 + i), dept: pick(depts), tool, score, severity: sev, lang: pick(langs) } });
    state.datasets.screeningsFull = state.datasets.screenings;

    // Resources
    const types = ["Video", "Audio", "Guide", "Worksheet", "Helpline"];
    state.datasets.resources = [{ title: "5-minute Breathing", type: "Audio", lang: "English", topic: "Anxiety", clicks: 342, updated: "2025-08-20" }, { title: "Sleep Hygiene (Tamil)", type: "Guide", lang: "Tamil", topic: "Sleep", clicks: 210, updated: "2025-07-14" }, { title: "PHQ-9 Explainer (Hindi)", type: "Video", lang: "Hindi", topic: "Depression", clicks: 189, updated: "2025-09-01" }, { title: "Grounding Exercise PDF", type: "Worksheet", lang: "English", topic: "Anxiety", clicks: 170, updated: "2025-08-28" }, { title: "Student Helpline", type: "Helpline", lang: "English", topic: "Crisis", clicks: 420, updated: "2025-06-10" }, ];

    // Counsellors
    state.datasets.counsellors = [{ name: "Dr. Meera N", spec: "Clinical Psychologist", langs: "English, Hindi, Tamil", slots: 18, wait: "2.1d", email: "meera@college.edu" }, { name: "Mr. Arjun S", spec: "Counsellor", langs: "English, Marathi", slots: 12, wait: "3.0d", email: "arjun@college.edu" }, { name: "Dr. Kavitha R", spec: "Psychiatrist (Visiting)", langs: "English, Tamil", slots: 8, wait: "4.5d", email: "kavitha@college.edu" }, { name: "Ms. Sana Q", spec: "Counsellor", langs: "English, Urdu", slots: 16, wait: "2.6d", email: "sana@college.edu" }];

    // Appointments (full)
    state.datasets.appointmentsFull = Array.from({ length: 30 }, (_, i) => ({ id: "BKG" + (2000 + i), student: "STU" + (4000 + i), dept: pick(depts), counsellor: pick(state.datasets.counsellors).name, mode: pick(modes), status: pick(status), date: fmtDate(new Date(today.getFullYear(), today.getMonth() - rand(0, 2), rand(1, 28))) }));
}

// Render helpers
function setActiveTab(tab) {
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab').forEach(sec => sec.style.display = 'none');
    const el = document.getElementById('tab-' + tab);
    if (el) el.style.display = '';
}

function renderOverview() {
    const tbodyA = document.querySelector('#tableAppointments tbody');
    tbodyA.innerHTML = state.datasets.appointments.map(a => `<tr><td>${a.id}</td><td>${a.dept}</td><td>${a.mode}</td><td><span class="badge ${a.status === 'Completed' ? 'ok' : a.status === 'Pending' ? 'warn' : ''}">${a.status}</span></td><td>${a.date}</td></tr>`).join('');
    document.getElementById('apptCount').textContent = `${state.datasets.appointments.length} items`;

    const tbodyF = document.querySelector('#tablePeerFlags tbody');
    tbodyF.innerHTML = state.datasets.peerFlags.map(p => `<tr><td>${p.thread}</td><td>${p.cat}</td><td>${p.flags}</td><td>${p.last}</td><td><button class="btn">Review</button></td></tr>`).join('');
    document.getElementById('flagCount').textContent = `${state.datasets.peerFlags.length} items`;
}

function renderScreenings() {
    const tool = document.getElementById('screeningTool').value;
    const sev = document.getElementById('screeningSeverity').value;
    const q = (document.getElementById('screeningSearch').value || "").toLowerCase();
    const f = state.filters;
    let rows = state.datasets.screeningsFull.filter(r => {
        const matchTool = !tool || r.tool === tool;
        const matchSev = !sev || r.severity === sev;
        const matchQ = !q || r.student.toLowerCase().includes(q);
        const matchDept = !f.dept || r.dept === f.dept;
        const matchLang = !f.lang || r.lang === f.lang;
        return matchTool && matchSev && matchQ && matchDept && matchLang;
    });
    const tbody = document.querySelector('#tableScreenings tbody');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.date}</td><td>${r.student}</td><td>${r.dept}</td><td>${r.tool}</td><td>${r.score}</td><td><span class="badge ${r.severity === 'Severe' || r.severity.includes('Severe') ? 'danger' : r.severity.includes('Moderate') ? 'warn' : 'ok'}">${r.severity}</span></td><td>${r.lang}</td></tr>`).join('');
    document.getElementById('screenCount').textContent = `${rows.length} items`;
}

function renderAppointmentsFull() {
    const st = document.getElementById('apptStatus').value;
    const md = document.getElementById('apptMode').value;
    const q = (document.getElementById('apptSearch').value || "").toLowerCase();
    const f = state.filters;
    let rows = state.datasets.appointmentsFull.filter(r => {
        const matchS = !st || r.status === st;
        const matchM = !md || r.mode === md;
        const matchQ = !q || r.id.toLowerCase().includes(q) || r.student.toLowerCase().includes(q);
        const matchDept = !f.dept || r.dept === f.dept;
        return matchS && matchM && matchQ && matchDept;
    });
    const tbody = document.querySelector('#tableAppointmentsFull tbody');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.id}</td><td>${r.student}</td><td>${r.dept}</td><td>${r.counsellor}</td><td>${r.mode}</td><td><span class="badge ${r.status === 'Completed' ? 'ok' : r.status === 'Pending' ? 'warn' : r.status === 'Cancelled' ? 'danger' : ''}">${r.status}</span></td><td>${r.date}</td></tr>`).join('');
    document.getElementById('apptFullCount').textContent = `${rows.length} items`;
}

function renderPeerThreads() {
    const cat = document.getElementById('peerCategoryFilter').value;
    const st = document.getElementById('peerStatusFilter').value;
    const threads = Array.from({ length: 16 }, (_, i) => ({ thread: "T-" + (500 + i), author: "ANON-" + rand(100, 999), category: pick(["Anxiety", "Depression", "Academics", "Relationships", "Sleep", "Substance"]), replies: rand(0, 22), flags: rand(0, 5), status: pick(["Open", "Under Review", "Closed"]), last: fmtDate(new Date(today.getFullYear(), today.getMonth() - rand(0, 2), rand(1, 28))) }));
    const f = state.filters;
    let rows = threads.filter(t => {
        const m1 = !cat || t.category === cat;
        const m2 = !st || t.status === st;
        const mDept = !f.dept || true; // Note: This filter is not applied to peer threads in the mock logic
        return m1 && m2 && mDept;
    });
    const tbody = document.querySelector('#tablePeerThreads tbody');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.thread}</td><td>${r.author}</td><td>${r.category}</td><td>${r.replies}</td><td>${r.flags}</td><td><span class="badge ${r.status === 'Open' ? 'warn' : r.status === 'Closed' ? 'ok' : ''}">${r.status}</span></td><td>${r.last}</td></tr>`).join('');
    document.getElementById('peerCount').textContent = `${rows.length} items`;
}

function renderResources() {
    const t = document.getElementById('resTypeFilter').value;
    const l = document.getElementById('resLangFilter').value;
    let rows = state.datasets.resources.filter(r => {
        const mt = !t || r.type === t;
        const ml = !l || r.lang === l;
        return mt && ml;
    });
    const tbody = document.querySelector('#tableResources tbody');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.title}</td><td>${r.type}</td><td>${r.lang}</td><td>${r.topic}</td><td>${r.clicks}</td><td>${r.updated}</td></tr>`).join('');
    document.getElementById('resCount').textContent = `${rows.length} items`;
}

function renderCounsellors() {
    const tbody = document.querySelector('#tableCounsellors tbody');
    tbody.innerHTML = state.datasets.counsellors.map(c => `<tr><td>${c.name}</td><td>${c.spec}</td><td>${c.langs}</td><td>${c.slots}</td><td>${c.wait}</td><td><a href="mailto:${c.email}">${c.email}</a></td></tr>`).join('');
    document.getElementById('counsellorCount').textContent = `${state.datasets.counsellors.length} items`;
}

// Charts
let chartTrends, chartRisk;
function renderCharts() {
    const isLightTheme = document.body.classList.contains('light-theme');
    Chart.defaults.color = isLightTheme ? 'rgba(26, 26, 26, 0.8)' : 'rgba(240, 240, 240, 0.8)';
    const gridColor = isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)';

    const ctx1 = document.getElementById('chartTrends');
    const weeks = ["Wk-1", "Wk-2", "Wk-3", "Wk-4", "Wk-5", "Wk-6"];
    const phq = weeks.map(() => rand(6, 14));
    const gad = weeks.map(() => rand(5, 12));
    if (chartTrends) chartTrends.destroy();
    chartTrends = new Chart(ctx1, { type: 'line', data: { labels: weeks, datasets: [{ label: 'PHQ-9', data: phq, borderColor: 'var(--brand)', backgroundColor: isLightTheme ? 'rgba(217,55,55,.25)' : 'rgba(229,62,62,.25)', tension: .35, fill: true }, { label: 'GAD-7', data: gad, borderColor: 'var(--brand-2)', backgroundColor: isLightTheme ? 'rgba(178,34,34,.22)' : 'rgba(197,48,48,.22)', tension: .35, fill: true }, ] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor }, suggestedMin: 0, suggestedMax: 21 } } } });

    const ctx2 = document.getElementById('chartRisk');
    const low = rand(40, 60), mod = rand(20, 30), high = rand(8, 14), crisis = rand(2, 6);
    if (chartRisk) chartRisk.destroy();
    chartRisk = new Chart(ctx2, { type: 'doughnut', data: { labels: ['Low', 'Moderate', 'High', 'Crisis'], datasets: [{ data: [low, mod, high, crisis], backgroundColor: ['#38a169', '#dd6b20', '#e53e3e', '#60a5fa'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { display: false } }, cutout: '62%' } });
}

// Filters panel behaviors
function updateActiveFilterCount() {
    const f = state.filters;
    const count = [f.dept, f.year, f.lang, f.risk].filter(Boolean).length + (f.text ? 1 : 0);
    document.getElementById('activeFilterCount').textContent = `${count} active filters`;
}

function applyTopFilters() {
    state.filters.dept = document.getElementById('filterDept').value;
    state.filters.year = document.getElementById('filterYear').value;
    state.filters.lang = document.getElementById('filterLang').value;
    state.filters.risk = document.getElementById('filterRisk').value;
    state.filters.rangeDays = parseInt(document.getElementById('dateRange').value, 10) || 30;
    state.filters.text = document.getElementById('searchInput').value.trim();
    updateActiveFilterCount();
    renderScreenings();
    renderAppointmentsFull();
    renderPeerThreads();
}

// Export CSV
function exportCSV() {
    const rows = [["Metric", "Value"], ["Active Students", "2340"], ["Completed Screenings", "1128"], ["Bookings (30d)", "278"], ["Avg Wait Time (days)", "2.3"], ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Modals
function openModal(id) { document.getElementById(id).style.display = 'flex' }
function closeModal(id) { document.getElementById(id).style.display = 'none' }

// Init
function init() {
    generateMock();
    renderOverview();
    renderScreenings();
    renderAppointmentsFull();
    renderPeerThreads();
    renderResources();
    renderCounsellors();
    updateActiveFilterCount();

    // Event Listeners
    document.querySelectorAll('#nav button').forEach(btn => { btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)); });
    ['filterDept', 'filterYear', 'filterLang', 'filterRisk', 'dateRange'].forEach(id => { document.getElementById(id).addEventListener('change', applyTopFilters); });
    document.getElementById('searchInput').addEventListener('input', applyTopFilters);
    document.getElementById('resetFilters').addEventListener('click', () => {
        ['filterDept', 'filterYear', 'filterLang', 'filterRisk', 'dateRange'].forEach(id => {
            document.getElementById(id).value = (id === 'dateRange') ? '30' : '';
        });
        document.getElementById('searchInput').value = '';
        applyTopFilters();
    });
    document.getElementById('exportCSV').addEventListener('click', exportCSV);

    ['screeningTool', 'screeningSeverity'].forEach(id => document.getElementById(id).addEventListener('change', renderScreenings));
    document.getElementById('screeningSearch').addEventListener('input', renderScreenings);
    ['apptStatus', 'apptMode'].forEach(id => document.getElementById(id).addEventListener('change', renderAppointmentsFull));
    document.getElementById('apptSearch').addEventListener('input', renderAppointmentsFull);
    ['peerCategoryFilter', 'peerStatusFilter'].forEach(id => document.getElementById(id).addEventListener('change', renderPeerThreads));
    ['resTypeFilter', 'resLangFilter'].forEach(id => document.getElementById(id).addEventListener('change', renderResources));

    document.getElementById('openCounsellorModal').addEventListener('click', () => openModal('counsellorModal'));
    document.getElementById('closeCounsellorModal').addEventListener('click', () => closeModal('counsellorModal'));
    document.getElementById('saveSlot').addEventListener('click', () => {
        const name = document.getElementById('counsellorSelect').value;
        const day = document.getElementById('slotDay').value;
        const time = document.getElementById('slotTime').value;
        const note = document.getElementById('slotNote').value;
        alert(`Saved: ${name} — ${day} ${time}${note ? (' | ' + note) : ''}`);
        closeModal('counsellorModal');
    });

    document.getElementById('openResourceModal').addEventListener('click', () => openModal('resourceModal'));
    document.getElementById('closeResourceModal').addEventListener('click', () => closeModal('resourceModal'));
    document.getElementById('saveResource').addEventListener('click', () => {
        const r = { title: document.getElementById('resTitle').value || 'Untitled', type: document.getElementById('resType').value, lang: document.getElementById('resLang').value, topic: document.getElementById('resTopic').value || 'General', clicks: rand(10, 60), updated: fmtDate(new Date()) };
        state.datasets.resources.unshift(r);
        renderResources();
        closeModal('resourceModal');
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal('counsellorModal'); closeModal('resourceModal'); } });
    document.querySelectorAll('.modal-backdrop').forEach(bg => { bg.addEventListener('click', (e) => { if (e.target === bg) bg.style.display = 'none' }) });

    // --- Theme and Logout Logic ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    renderCharts(); // Render charts after setting theme

    document.getElementById('themeToggle').addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        renderCharts(); // Re-render charts with new theme colors
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        alert('You have been logged out.');
        // In a real application, you would add redirection logic here
        // e.g., location.href = '/login';
    });
}

document.addEventListener('DOMContentLoaded', init);