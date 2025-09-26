document.addEventListener("DOMContentLoaded", () => {
    // --- 1. GLOBAL ELEMENT SELECTORS ---
    const mainVideoPlayer = document.getElementById('main-video-player');
    const mainVideoTitle = document.getElementById('main-video-title');
    const audioPlayer = {
        audio: document.getElementById('audio-element'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playIcon: document.getElementById('play-icon'),
        pauseIcon: document.getElementById('pause-icon'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        albumArt: document.getElementById('album-art'),
        trackTitle: document.getElementById('track-title'),
        trackArtist: document.getElementById('track-artist'),
        progressContainer: document.getElementById('progress-container'),
        progressBar: document.getElementById('progress-bar'),
        currentTimeEl: document.getElementById('current-time'),
        durationEl: document.getElementById('duration')
    };
    const resourceLibrarySection = document.querySelector('.resource-library-section');
    const recommendationSection = document.getElementById('recommendation-section');
    const quoteContainer = document.getElementById('quote-container');
    const selectorCard = document.getElementById('gradient-selector-card');
    
    let audioTracks = [];
    let currentAudioIndex = 0;
    let isPlaying = false;

    // --- 2. UNIVERSAL PLAYER LOGIC ---
    function playResource(resource) {
        if (!resource) return;

        if (resource.type === 'video') {
            if (mainVideoPlayer) {
                let videoId;
                if (resource.link.includes('watch?v=')) {
                    videoId = resource.link.split('v=')[1].split('&')[0];
                } else if (resource.link.includes('youtu.be/')) {
                    videoId = resource.link.split('youtu.be/')[1];
                }
                if (videoId) {
                    mainVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    mainVideoTitle.textContent = resource.title;
                }
            }
        } else if (resource.type === 'audio') {
            const trackIdx = audioTracks.findIndex(t => t.id === resource.id);
            if (trackIdx !== -1) {
                currentAudioIndex = trackIdx;
            } else {
                audioTracks.unshift(resource);
                currentAudioIndex = 0;
            }
            loadAudioTrack(currentAudioIndex);
            playAudio();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- 3. AUDIO PLAYER LOGIC ---
    function loadAudioTrack(index) {
        if (!audioPlayer.audio || !audioTracks[index]) return;
        const track = audioTracks[index];
        audioPlayer.trackTitle.textContent = track.title;
        audioPlayer.trackArtist.textContent = track.artist || 'Soundscape';
        audioPlayer.albumArt.src = track.thumbnailUrl;
        // This points to your backend proxy to avoid security errors
        audioPlayer.audio.src = `/api/audio-proxy?url=${encodeURIComponent(track.link)}`;
    }

    function playAudio() {
        if (!audioPlayer.audio) return;
        isPlaying = true;
        audioPlayer.playIcon.style.display = 'none';
        audioPlayer.pauseIcon.style.display = 'block';
        audioPlayer.audio.play().catch(error => console.error("Audio play failed:", error));
    }

    function pauseAudio() {
        if (!audioPlayer.audio) return;
        isPlaying = false;
        audioPlayer.playIcon.style.display = 'block';
        audioPlayer.pauseIcon.style.display = 'none';
        audioPlayer.audio.pause();
    }
    
    function setupAudioPlayer() {
        if (!audioPlayer.audio) return;
        audioPlayer.playPauseBtn.addEventListener('click', () => isPlaying ? pauseAudio() : playAudio());
        audioPlayer.nextBtn.addEventListener('click', () => { if (audioTracks.length === 0) return; currentAudioIndex = (currentAudioIndex + 1) % audioTracks.length; loadAudioTrack(currentAudioIndex); playAudio(); });
        audioPlayer.prevBtn.addEventListener('click', () => { if (audioTracks.length === 0) return; currentAudioIndex = (currentAudioIndex - 1 + audioTracks.length) % audioTracks.length; loadAudioTrack(currentAudioIndex); playAudio(); });
        audioPlayer.audio.addEventListener('timeupdate', (e) => { const { duration, currentTime } = e.target; audioPlayer.progressBar.style.width = `${(currentTime / duration) * 100}%`; audioPlayer.currentTimeEl.textContent = formatTime(currentTime); });
        audioPlayer.audio.addEventListener('loadedmetadata', () => { audioPlayer.durationEl.textContent = formatTime(audioPlayer.audio.duration); });
        audioPlayer.progressContainer.addEventListener('click', (e) => { if(!audioPlayer.audio.duration) return; const width = audioPlayer.progressContainer.clientWidth; const clickX = e.offsetX; audioPlayer.audio.currentTime = (clickX / width) * audioPlayer.audio.duration; });
        audioPlayer.audio.addEventListener('ended', () => { document.getElementById('next-btn').click(); });
    }
    
    function formatTime(seconds) { if (isNaN(seconds)) return "0:00"; const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }

    // --- 4. DATA FETCHING AND UI POPULATION ---
    async function populateResourceLibrary() {
        if(!resourceLibrarySection) return;
        try {
            const response = await fetch('http://localhost:3000/api/resources');
            if (!response.ok) throw new Error('Network response failed');
            const data = await response.json();

            const videoStrip = document.getElementById('video-strip');
            const audioStrip = document.getElementById('audio-strip');
            if (videoStrip) videoStrip.innerHTML = '';
            if (audioStrip) audioStrip.innerHTML = '';

            const allVideos = Object.values(data.videos || {}).flat();
            const allAudios = Object.values(data.audios || {}).flat();
            
            allVideos.forEach(video => videoStrip.appendChild(createResourceCard(video)));
            allAudios.forEach(audio => audioStrip.appendChild(createResourceCard(audio)));
            
            audioTracks = allAudios;
            if (audioTracks.length > 0) loadAudioTrack(0);

            setupSearch();
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        }
    }

    function createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.dataset.title = resource.title;
        card.innerHTML = `<img src="${resource.thumbnailUrl}" alt="${resource.title}" loading="lazy"><div class="card-overlay"><div class="play-button">▶</div><div class="card-info"><p>${resource.title}</p><span>${resource.duration}</span></div></div>`;
        card.addEventListener('click', () => playResource(resource));
        return card;
    }

    function setupSearch() {
        const searchInput = document.getElementById('resource-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.resource-card').forEach(card => {
                    const title = card.dataset.title.toLowerCase();
                    card.style.display = title.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }
    }
    
    // --- 5. STRESS SELECTOR & RECOMMENDATIONS ---
    if (selectorCard) {
        const stressLevelOptions = [ { id: "calm", label: "Calm", color: "#22c55e", gradientFrom: "#22c55e", gradientTo: "#86efac" }, { id: "mild", label: "Mild", color: "#eab308", gradientFrom: "#eab308", gradientTo: "#fde047" }, { id: "moderate", label: "Moderate", color: "#f97316", gradientFrom: "#f97316", gradientTo: "#fdba74" }, { id: "high", label: "High", color: "#ef4444", gradientFrom: "#ef4444", gradientTo: "#fca5a5" }];
        const circles = document.querySelectorAll('.selector-circle');
        const lines = document.querySelectorAll('.selector-line');
        const labels = document.querySelectorAll('.selector-label-item span');
        const radialOverlay = document.getElementById('radial-gradient-overlay');

        const createOrbitalDots = (circleElement, color) => { const existingDots = circleElement.querySelectorAll('.orbital-dot'); existingDots.forEach(dot => dot.remove()); const count = 12; const radius = 16; for (let i = 0; i < count; i++) { const angle = (i / count) * 2 * Math.PI; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; const dot = document.createElement('div'); dot.className = 'orbital-dot'; dot.style.backgroundColor = color; dot.style.transform = `translateX(-50%) translateY(-50%) translate(${x}px, ${y}px) scale(0.3)`; dot.style.animationDelay = `${i * 0.03}s`; void dot.offsetWidth; circleElement.appendChild(dot); } };
        const handleSelection = async (selectedIndex) => {
            circles.forEach((circle, index) => { const option = stressLevelOptions[index]; const isSelected = index <= selectedIndex; circle.style.backgroundColor = isSelected ? option.color : 'var(--unselected-color)'; circle.style.boxShadow = isSelected ? `0 0 20px ${option.color}40, 0 0 40px ${option.color}20` : 'none'; if (index === selectedIndex) createOrbitalDots(circle, option.color); else circle.querySelectorAll('.orbital-dot').forEach(d => d.remove()); });
            lines.forEach((line, index) => { const isLitUp = index < selectedIndex; const currentOption = stressLevelOptions[index]; const nextOption = stressLevelOptions[index + 1]; line.style.background = isLitUp ? `linear-gradient(to right, ${currentOption.gradientFrom}, ${nextOption.gradientTo})` : 'var(--unselected-color)'; });
            labels.forEach((label, index) => { label.style.color = index <= selectedIndex ? stressLevelOptions[index].color : 'var(--text-muted-color)'; });
            if (selectedIndex >= 0) { const activeCircle = circles[selectedIndex]; const cardRect = selectorCard.getBoundingClientRect(); const circleRect = activeCircle.getBoundingClientRect(); const x = circleRect.left + circleRect.width / 2 - cardRect.left; const y = circleRect.top + circleRect.height / 2 - cardRect.top; const color = stressLevelOptions[selectedIndex].color; radialOverlay.style.background = `radial-gradient(circle at ${x}px ${y}px, ${color}20 0%, ${color}10 30%, transparent 70%)`; }
            getRecommendations(stressLevelOptions[selectedIndex].label);
        };
        const getRecommendations = async (stressLevel) => { recommendationSection.innerHTML = `<h2>Loading...</h2>`; recommendationSection.classList.add('visible'); try { const response = await fetch('http://localhost:3000/api/brain/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stressLevel: stressLevel.toLowerCase() }) }); if (!response.ok) throw new Error('Failed to get recommendation'); const { recommendedVideo, recommendedAudio } = await response.json(); displayRecommendations(recommendedVideo, recommendedAudio); } catch (error) { console.error("Recommendation Error:", error); recommendationSection.innerHTML = `<h2>Could not get recommendation.</h2>`; } };
        const displayRecommendations = (video, audio) => { recommendationSection.innerHTML = `<h2>Recommended For You</h2>`; const grid = document.createElement('div'); grid.className = 'recommendation-grid'; if (video) grid.appendChild(createRecommendationCard(video)); if (audio) grid.appendChild(createRecommendationCard(audio)); recommendationSection.appendChild(grid); };
        const createRecommendationCard = (resource) => { if (!resource) return document.createDocumentFragment(); const card = document.createElement('div'); card.className = 'recommendation-card'; const type = resource.type === 'video' ? 'Video' : 'Audio'; card.innerHTML = `<img src="${resource.thumbnailUrl}" alt="${resource.title}" class="thumb" loading="lazy"><div class="info"><p class="type">${type} Recommendation</p><h3 class="title">${resource.title}</h3><button class="play-link">${type === 'Video' ? 'Watch Now' : 'Listen Now'}</button></div>`; card.addEventListener('click', () => playResource(resource)); return card; };
        
        circles.forEach(circle => circle.addEventListener('click', () => handleSelection(parseInt(circle.dataset.index))));
        labels.forEach(label => label.addEventListener('click', () => handleSelection(parseInt(label.dataset.index))));
        handleSelection(0);
    }
    
    // --- 6. QUOTE ROTATOR ---
    if (quoteContainer) { /* ... same as before ... */ }

    // --- 7. INITIALIZE PAGE ---
    setupAudioPlayer();
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { populateResourceLibrary(); observer.unobserve(resourceLibrarySection); } }, { threshold: 0.1 }); 
    if (resourceLibrarySection) { observer.observe(resourceLibrarySection); }

    // --- Sidebar and Auth logic ---
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html' && window.location.pathname !== '/') {
        // window.location.href = '/login.html'; // Or your main welcome page
    }
    // You would typically fetch user data here as well if the token exists
});

// Adding sidebar/header script separately to avoid conflicts with DOMContentLoaded
const profileButton = document.getElementById('profile-button');
const profileDropdown = document.getElementById('profile-dropdown');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mainPanel = document.getElementById('main-panel');
if(profileButton) {
    profileButton.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
}
if(document) {
    document.addEventListener('click', (e) => { if (profileDropdown && !profileButton.contains(e.target)) profileDropdown.classList.add('hidden'); });
}
function toggleSidebar() { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('hidden'); mobileMenuButton.classList.toggle('open'); }
if(mobileMenuButton) mobileMenuButton.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
if(sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

if (window.innerWidth >= 768) {
    const triggerZoneWidth = 20;
    document.addEventListener('mousemove', function(e) {
        if (!sidebar || !mainPanel) return;
        if (sidebar.classList.contains('open')) return;
        const sidebarRect = sidebar.getBoundingClientRect();
        if (e.clientX <= triggerZoneWidth) { sidebar.style.transform = 'translateX(0)'; mainPanel.style.marginLeft = '256px'; }
        else if (e.clientX > sidebarRect.right + triggerZoneWidth) { sidebar.style.transform = 'translateX(-100%)'; mainPanel.style.marginLeft = '0'; }
    });
    document.body.addEventListener('mouseleave', function() { 
        if (!sidebar || !mainPanel) return;
        if (!sidebar.classList.contains('open')) { sidebar.style.transform = 'translateX(-100%)'; mainPanel.style.marginLeft = '0'; }
    });
}
document.querySelectorAll('a[href]').forEach(link => { if (link.href && link.href.includes('.html')) { link.addEventListener('click', e => { e.preventDefault(); window.location.href = link.href; });}});
