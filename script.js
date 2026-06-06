// --- Radio León de Juda - Streaming & Audio Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const audioStreamUrl = 'https://stream.zeno.fm/nrf3kkca998uv';
    const audio = document.getElementById('radio-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('svg-play');
    const pauseIcon = document.getElementById('svg-pause');
    const playerCard = document.querySelector('.player-card');
    
    const volumeMuteBtn = document.getElementById('volume-mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('svg-volume');
    const muteIcon = document.getElementById('svg-mute');
    
    const visualizerBars = document.querySelectorAll('.visualizer .bar');
    
    let isPlaying = false;
    let isMuted = false;
    let savedVolume = 1;
    let visualizerInterval = null;

    // Initialize player state
    audio.volume = volumeSlider.value;

    // --- Audio Control Functions ---

    function playRadio() {
        // Force reload from the live source to avoid listening to buffered stale audio
        audio.src = audioStreamUrl;
        audio.load();
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateUIState(true);
                startVisualizerAnimation();
            }).catch(error => {
                console.error("Error al reproducir audio: ", error);
                isPlaying = false;
                updateUIState(false);
            });
        }
    }

    function pauseRadio() {
        audio.pause();
        // Clear source and load to release network resources and stop background downloading
        audio.src = '';
        audio.load();
        
        isPlaying = false;
        updateUIState(false);
        stopVisualizerAnimation();
    }

    function togglePlay() {
        if (isPlaying) {
            pauseRadio();
        } else {
            playRadio();
        }
    }

    function updateUIState(playing) {
        if (playing) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            playerCard.classList.add('active');
            playPauseBtn.setAttribute('aria-label', 'Pausar');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            playerCard.classList.remove('active');
            playPauseBtn.setAttribute('aria-label', 'Reproducir');
        }
    }

    // --- Simulated Visualizer (CORS-Safe & Highly Realistic) ---

    function startVisualizerAnimation() {
        if (visualizerInterval) clearInterval(visualizerInterval);
        
        // Generate natural, organic wave-like motion for the bars
        let tick = 0;
        visualizerInterval = setInterval(() => {
            tick++;
            visualizerBars.forEach((bar, index) => {
                // Combine sine waves with random noise for organic movement
                const phase = (tick * 0.15) + (index * 0.5);
                const noise = Math.sin(phase) * 15 + Math.cos(phase * 0.7) * 10;
                // Base height of 22px plus dynamic oscillation between 6px and 45px
                let newHeight = Math.max(6, Math.min(46, 25 + noise));
                
                // Add some random peaks occasionally
                if (Math.random() > 0.95) {
                    newHeight = Math.min(46, newHeight + 10);
                }
                
                bar.style.height = `${newHeight}px`;
            });
        }, 80);
    }

    function stopVisualizerAnimation() {
        if (visualizerInterval) {
            clearInterval(visualizerInterval);
            visualizerInterval = null;
        }
        
        // Reset all bars to default minimum height
        visualizerBars.forEach(bar => {
            bar.style.height = '6px';
        });
    }

    // --- Volume & Mute Controls ---

    function updateVolumeIcon(vol) {
        if (vol === 0 || isMuted) {
            volumeIcon.classList.add('hidden');
            muteIcon.classList.remove('hidden');
        } else {
            volumeIcon.classList.remove('hidden');
            muteIcon.classList.add('hidden');
        }
    }

    function handleVolumeChange() {
        const volumeVal = parseFloat(volumeSlider.value);
        audio.volume = volumeVal;
        savedVolume = volumeVal;
        
        if (volumeVal === 0) {
            isMuted = true;
        } else {
            isMuted = false;
        }
        updateVolumeIcon(volumeVal);
    }

    function toggleMute() {
        if (isMuted) {
            isMuted = false;
            audio.volume = savedVolume > 0 ? savedVolume : 0.5;
            volumeSlider.value = audio.volume;
        } else {
            isMuted = true;
            savedVolume = parseFloat(volumeSlider.value);
            audio.volume = 0;
            volumeSlider.value = 0;
        }
        updateVolumeIcon(audio.volume);
    }

    // --- Event Listeners ---

    playPauseBtn.addEventListener('click', togglePlay);
    volumeMuteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', handleVolumeChange);

    // Stop and clean resources if the page is closed/hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            // Optional: You can let the radio play in background (recommended for radio websites).
            // But if there is a crash or browser suspends, we handle states gracefully.
        }
    });
});
